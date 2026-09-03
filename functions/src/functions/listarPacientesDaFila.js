'use strict';

const { app } = require('@azure/functions');
const { getCollection } = require('../shared/mongo');
const { ok, erro, ordenarFila, toPacienteFila } = require('../shared/fila');

// GET /api/fila/{unidadeId}/pacientes
// Lista os pacientes aguardando atendimento em uma unidade, na ordem da fila.
app.http('listarPacientesDaFila', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'fila/{unidadeId}/pacientes',
  handler: async (request, context) => {
    const unidadeId = request.params.unidadeId;
    try {
      const col = await getCollection();
      const unidade = await col.findOne({ id: unidadeId });
      if (!unidade) {
        return erro(404, 'UNIDADE_NAO_ENCONTRADA', 'Nenhuma unidade encontrada com o id informado.');
      }
      const fila = ordenarFila(unidade.pacientes || []).map(toPacienteFila);
      return ok(fila);
    } catch (e) {
      context.error('Falha ao listar pacientes:', e);
      return erro(500, 'ERRO_INTERNO', 'Não foi possível listar os pacientes.');
    }
  },
});
