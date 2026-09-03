'use strict';

const { app } = require('@azure/functions');
const { getCollection } = require('../shared/mongo');
const { ok, erro, toPacienteFila } = require('../shared/fila');

// POST /api/fila/{unidadeId}/pacientes
// Enfileira um novo paciente na unidade. (Endpoint inferido — não consta no
// APIDOG atual; mantém a simetria com "chamar-proximo" e alimenta os inserts.)
// Body: { "nome": string, "prioridade": "normal" | "urgente" }
app.http('adicionarPacienteNaFila', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'fila/{unidadeId}/pacientes',
  handler: async (request, context) => {
    const unidadeId = request.params.unidadeId;
    try {
      let body = {};
      try {
        body = await request.json();
      } catch {
        return erro(400, 'CORPO_INVALIDO', 'Corpo da requisição deve ser um JSON válido.');
      }

      const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
      if (!nome) {
        return erro(400, 'NOME_OBRIGATORIO', 'O campo "nome" é obrigatório.');
      }

      const prioridade = body.prioridade === 'urgente' ? 'urgente' : 'normal';

      const paciente = {
        id: `pac-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
        nome,
        horarioChegada: new Date().toISOString(),
        prioridade,
      };

      const col = await getCollection();
      const res = await col.updateOne(
        { id: unidadeId },
        { $push: { pacientes: paciente } }
      );

      if (res.matchedCount === 0) {
        return erro(404, 'UNIDADE_NAO_ENCONTRADA', 'Nenhuma unidade encontrada com o id informado.');
      }

      return ok(toPacienteFila(paciente), 201);
    } catch (e) {
      context.error('Falha ao adicionar paciente:', e);
      return erro(500, 'ERRO_INTERNO', 'Não foi possível adicionar o paciente à fila.');
    }
  },
});
