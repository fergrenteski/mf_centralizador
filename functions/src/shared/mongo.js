'use strict';

const { MongoClient } = require('mongodb');

// O MongoClient é reaproveitado entre invocações da mesma instância "quente" da
// Function (variáveis de módulo persistem), evitando reconectar a cada request.
let clientPromise = null;

function getClient() {
  if (!clientPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(
        'MONGODB_URI não configurada. Defina em local.settings.json (local) ou nas Application Settings do Azure.'
      );
    }
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10,
    });
    clientPromise = client.connect();
  }
  return clientPromise;
}

/**
 * Retorna a collection configurada.
 * Padrão: banco "furafila", coleção "open-prontuario".
 * @returns {Promise<import('mongodb').Collection>}
 */
async function getCollection() {
  const client = await getClient();
  const dbName = process.env.MONGODB_DB || 'furafila';
  const collName = process.env.MONGODB_COLLECTION || 'open-prontuario';
  return client.db(dbName).collection(collName);
}

module.exports = { getClient, getCollection };
