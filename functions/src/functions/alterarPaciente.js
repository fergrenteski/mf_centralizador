'use strict';

const { app } = require('@azure/functions');
const { getCollection } = require('../shared/mongo');
const { ok, erro, toPacienteFila } = require('../shared/fila');

// PUT /api/fila/{unidadeId}/pacientes/{pacienteId}
// ALTERAR nome e/ou prioridade de um paciente da fila.
// Body: { "nome"?: string, "prioridade"?: "normal" | "urgente" }
app.http('alterarPaciente', {
  methods: ['PUT', 'PATCH'],
  authLevel: 'anonymous',
  route: 'fila/{unidadeId}/pacientes/{pacienteId}',
  handler: async (request, context) => {
    const { unidadeId, pacienteId } = request.params;
    try {
      let body = {};
      try {
        body = await request.json();
      } catch {
        return erro(400, 'CORPO_INVALIDO', 'Corpo da requisição deve ser um JSON válido.');
      }

      // monta o $set só com os campos enviados
      const set = {};
      if (body.nome !== undefined) {
        const nome = String(body.nome).trim();
        if (!nome) return erro(400, 'NOME_INVALIDO', 'O campo "nome" não pode ser vazio.');
        set['pacientes.$.nome'] = nome;
      }
      if (body.prioridade !== undefined) {
        if (body.prioridade !== 'normal' && body.prioridade !== 'urgente') {
          return erro(400, 'PRIORIDADE_INVALIDA', 'prioridade deve ser "normal" ou "urgente".');
        }
        set['pacientes.$.prioridade'] = body.prioridade;
      }
      if (Object.keys(set).length === 0) {
        return erro(400, 'NADA_A_ALTERAR', 'Informe "nome" e/ou "prioridade".');
      }

      const col = await getCollection();

      // distingue unidade inexistente de paciente inexistente
      const unidade = await col.findOne({ id: unidadeId });
      if (!unidade) {
        return erro(404, 'UNIDADE_NAO_ENCONTRADA', 'Nenhuma unidade encontrada com o id informado.');
      }
      if (!(unidade.pacientes || []).some((p) => p.id === pacienteId)) {
        return erro(404, 'PACIENTE_NAO_ENCONTRADO', 'Nenhum paciente encontrado com o id informado nesta unidade.');
      }

      await col.updateOne(
        { id: unidadeId, 'pacientes.id': pacienteId },
        { $set: set }
      );

      const atualizado = await col.findOne(
        { id: unidadeId },
        { projection: { pacientes: { $elemMatch: { id: pacienteId } } } }
      );
      return ok(toPacienteFila(atualizado.pacientes[0]));
    } catch (e) {
      context.error('Falha ao alterar paciente:', e);
      return erro(500, 'ERRO_INTERNO', 'Não foi possível alterar o paciente.');
    }
  },
});
