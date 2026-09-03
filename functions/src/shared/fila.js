'use strict';

// Helpers de domínio + respostas HTTP padronizadas, compartilhados pelas functions.

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/** Resposta de sucesso com corpo JSON (200 por padrão). */
function ok(body, status = 200) {
  return { status, headers: JSON_HEADERS, jsonBody: body };
}

/** Resposta de erro no formato do schema `Erro` do APIDOG. */
function erro(status, codigo, mensagem) {
  return { status, headers: JSON_HEADERS, jsonBody: { codigo, mensagem } };
}

/**
 * Ordem da fila: urgentes primeiro, depois por ordem de chegada (mais antigo primeiro).
 */
function ordenarFila(pacientes = []) {
  const peso = (p) => (p.prioridade === 'urgente' ? 0 : 1);
  return [...pacientes].sort((a, b) => {
    if (peso(a) !== peso(b)) return peso(a) - peso(b);
    return new Date(a.horarioChegada) - new Date(b.horarioChegada);
  });
}

/** Projeta um documento de unidade para o schema `UnidadeSaude` (deriva tamanhoFila). */
function toUnidadeSaude(doc) {
  return {
    id: doc.id,
    nome: doc.nome,
    tipo: doc.tipo,
    tamanhoFila: Array.isArray(doc.pacientes) ? doc.pacientes.length : 0,
    tempoMedioEsperaMin: doc.tempoMedioEsperaMin ?? 0,
  };
}

/** Projeta um paciente para o schema `PacienteFila` (remove campos internos). */
function toPacienteFila(p) {
  return {
    id: p.id,
    nome: p.nome,
    horarioChegada: p.horarioChegada,
    prioridade: p.prioridade,
  };
}

module.exports = {
  JSON_HEADERS,
  ok,
  erro,
  ordenarFila,
  toUnidadeSaude,
  toPacienteFila,
};
