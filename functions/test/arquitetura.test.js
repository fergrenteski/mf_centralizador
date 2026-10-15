// Testes de arquitetura (ArchUnitTS) — Clean Architecture + Vertical Slice no BFF.
// Slices: src/functions/<caso-de-uso>.js | Domínio: src/shared/fila.js | Infra: src/shared/mongo.js
import { test } from 'node:test';
import assert from 'node:assert';
import { projectFiles } from 'archunit';

// O grafo do ArchUnitTS inclui a aresta de cada arquivo para ele mesmo; ela não é dependência real.
const semViolacoes = async (rule) => {
  const violacoes = (await rule.check()).filter((v) => !v.dependency || v.dependency.sourceLabel !== v.dependency.targetLabel);
  assert.deepStrictEqual(violacoes, []);
};

test('domínio (shared/fila) não depende da infraestrutura (mongo)', () =>
  semViolacoes(projectFiles().inPath('src/shared/fila.js').shouldNot().dependOnFiles().inPath('src/shared/mongo.js')));

test('camada shared não depende das slices (functions)', () =>
  semViolacoes(projectFiles().inFolder('src/shared/**').shouldNot().dependOnFiles().inFolder('src/functions/**')));

test('slices (functions) são independentes entre si', () =>
  semViolacoes(projectFiles().inFolder('src/functions/**').shouldNot().dependOnFiles().inFolder('src/functions/**')));

test('não há dependências cíclicas', () =>
  semViolacoes(projectFiles().inFolder('src/**').should().haveNoCycles()));
