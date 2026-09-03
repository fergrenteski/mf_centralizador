'use strict';

const { app } = require('@azure/functions');
const { getCollection } = require('../shared/mongo');
const { ok, erro, toUnidadeSaude } = require('../shared/fila');

// GET /api/fila
// Lista as unidades de saúde com o status atual da fila (tamanho + tempo médio).
app.http('listarUnidadesComFila', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'fila',
  handler: async (request, context) => {
    try {
      const col = await getCollection();
      const docs = await col.find({}).sort({ id: 1 }).toArray();
      return ok(docs.map(toUnidadeSaude));
    } catch (e) {
      context.error('Falha ao listar unidades:', e);
      return erro(500, 'ERRO_INTERNO', 'Não foi possível listar as unidades.');
    }
  },
});
