'use strict';

const { app } = require('@azure/functions');
const { getCollection } = require('../shared/mongo');
const { ok, erro } = require('../shared/fila');
const { buildSeed } = require('../shared/seedData');

// POST /api/seed
// Popula a collection `open-prontuario` com dados realistas (limpa antes).
// Protegida por um token simples via header `x-seed-token` OU query `?token=`,
// comparado com a app setting SEED_TOKEN (se definida). Sem SEED_TOKEN, libera.
app.http('seedDados', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'seed',
  handler: async (request, context) => {
    try {
      const expected = process.env.SEED_TOKEN;
      if (expected) {
        const provided = request.headers.get('x-seed-token') || request.query.get('token');
        if (provided !== expected) {
          return erro(401, 'NAO_AUTORIZADO', 'Token de seed inválido ou ausente.');
        }
      }

      const unidades = buildSeed();
      const col = await getCollection();

      await col.deleteMany({});
      const res = await col.insertMany(unidades);

      const totalPacientes = unidades.reduce((acc, u) => acc + u.pacientes.length, 0);

      return ok({
        mensagem: 'Collection populada com sucesso.',
        unidadesInseridas: res.insertedCount,
        pacientesInseridos: totalPacientes,
        unidades: unidades.map((u) => ({ id: u.id, nome: u.nome, pacientes: u.pacientes.length })),
      });
    } catch (e) {
      context.error('Falha ao popular dados:', e);
      return erro(500, 'ERRO_INTERNO', 'Não foi possível popular os dados.');
    }
  },
});
