'use strict';

const { app } = require('@azure/functions');
const { getCollection } = require('../shared/mongo');
const { ok, erro } = require('../shared/fila');

// DELETE /api/fila/{unidadeId}/pacientes/{pacienteId}
// EXCLUIR um paciente da fila de uma unidade.
app.http('removerPaciente', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'fila/{unidadeId}/pacientes/{pacienteId}',
  handler: async (request, context) => {
    const { unidadeId, pacienteId } = request.params;
    try {
      const col = await getCollection();

      const unidade = await col.findOne({ id: unidadeId });
      if (!unidade) {
        return erro(404, 'UNIDADE_NAO_ENCONTRADA', 'Nenhuma unidade encontrada com o id informado.');
      }

      const res = await col.updateOne(
        { id: unidadeId },
        { $pull: { pacientes: { id: pacienteId } } }
      );

      if (res.modifiedCount === 0) {
        return erro(404, 'PACIENTE_NAO_ENCONTRADO', 'Nenhum paciente encontrado com o id informado nesta unidade.');
      }

      return ok({ removido: true, id: pacienteId, unidadeId });
    } catch (e) {
      context.error('Falha ao remover paciente:', e);
      return erro(500, 'ERRO_INTERNO', 'Não foi possível remover o paciente.');
    }
  },
});
