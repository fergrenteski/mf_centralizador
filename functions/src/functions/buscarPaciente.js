'use strict';

import { app } from '@azure/functions';
import { getCollection } from '../shared/mongo.js';
import { ok, erro, toPacienteFila } from '../shared/fila.js';

// GET /api/fila/{unidadeId}/pacientes/{pacienteId}
// PESQUISAR um paciente específico da fila de uma unidade.
app.http('buscarPaciente', {
  methods: ['GET'],
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
      const paciente = (unidade.pacientes || []).find((p) => p.id === pacienteId);
      if (!paciente) {
        return erro(404, 'PACIENTE_NAO_ENCONTRADO', 'Nenhum paciente encontrado com o id informado nesta unidade.');
      }
      return ok(toPacienteFila(paciente));
    } catch (e) {
      context.error('Falha ao buscar paciente:', e);
      return erro(500, 'ERRO_INTERNO', 'Não foi possível buscar o paciente.');
    }
  },
});
