'use strict';

const { app } = require('@azure/functions');
const { getCollection } = require('../shared/mongo');
const { ok, erro, ordenarFila, toPacienteFila } = require('../shared/fila');

// POST /api/fila/{unidadeId}/chamar-proximo
// Seleciona o próximo paciente (urgentes primeiro, depois ordem de chegada),
// remove-o da fila persistida e o retorna.
app.http('chamarProximoPaciente', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'fila/{unidadeId}/chamar-proximo',
  handler: async (request, context) => {
    const unidadeId = request.params.unidadeId;
    try {
      const col = await getCollection();
      const unidade = await col.findOne({ id: unidadeId });
      if (!unidade) {
        return erro(404, 'UNIDADE_NAO_ENCONTRADA', 'Nenhuma unidade encontrada com o id informado.');
      }

      const fila = ordenarFila(unidade.pacientes || []);
      if (fila.length === 0) {
        return erro(404, 'FILA_VAZIA', 'Não há pacientes aguardando nesta unidade.');
      }

      const proximo = fila[0];
      // Persiste a chamada removendo o paciente da fila da unidade.
      await col.updateOne(
        { id: unidadeId },
        { $pull: { pacientes: { id: proximo.id } } }
      );

      return ok(toPacienteFila(proximo));
    } catch (e) {
      context.error('Falha ao chamar próximo paciente:', e);
      return erro(500, 'ERRO_INTERNO', 'Não foi possível chamar o próximo paciente.');
    }
  },
});
