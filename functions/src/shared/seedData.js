'use strict';

// Dataset realista (pt-BR) usado pela function `seedDados` para popular a
// collection `open-prontuario`. Cada documento é uma UNIDADE com os pacientes
// embutidos em `pacientes`; o `tamanhoFila` é derivado do tamanho desse array.

// Gera um ISO string com `minutosAtras` minutos antes de agora (fuso -03:00 preservado pelo ISO em UTC).
function chegadaHa(minutosAtras) {
  return new Date(Date.now() - minutosAtras * 60 * 1000).toISOString();
}

function buildSeed() {
  return [
    {
      id: 'ubs-01',
      nome: 'UBS Jardim das Flores',
      tipo: 'UBS',
      tempoMedioEsperaMin: 35,
      pacientes: [
        { id: 'pac-101', nome: 'Maria Souza', horarioChegada: chegadaHa(75), prioridade: 'normal' },
        { id: 'pac-102', nome: 'João Pereira', horarioChegada: chegadaHa(60), prioridade: 'urgente' },
        { id: 'pac-103', nome: 'Ana Beatriz Lima', horarioChegada: chegadaHa(52), prioridade: 'normal' },
        { id: 'pac-104', nome: 'Carlos Eduardo Nunes', horarioChegada: chegadaHa(40), prioridade: 'normal' },
        { id: 'pac-105', nome: 'Fernanda Oliveira', horarioChegada: chegadaHa(33), prioridade: 'urgente' },
        { id: 'pac-106', nome: 'Roberto Alves', horarioChegada: chegadaHa(25), prioridade: 'normal' },
        { id: 'pac-107', nome: 'Juliana Castro', horarioChegada: chegadaHa(18), prioridade: 'normal' },
        { id: 'pac-108', nome: 'Marcos Vinícius Rocha', horarioChegada: chegadaHa(9), prioridade: 'normal' },
      ],
    },
    {
      id: 'upa-01',
      nome: 'UPA Central',
      tipo: 'UPA',
      tempoMedioEsperaMin: 70,
      pacientes: [
        { id: 'pac-201', nome: 'Patrícia Gomes', horarioChegada: chegadaHa(120), prioridade: 'urgente' },
        { id: 'pac-202', nome: 'Sérgio Ramos', horarioChegada: chegadaHa(110), prioridade: 'normal' },
        { id: 'pac-203', nome: 'Luciana Ferreira', horarioChegada: chegadaHa(95), prioridade: 'urgente' },
        { id: 'pac-204', nome: 'Bruno Cardoso', horarioChegada: chegadaHa(80), prioridade: 'normal' },
        { id: 'pac-205', nome: 'Camila Duarte', horarioChegada: chegadaHa(68), prioridade: 'normal' },
        { id: 'pac-206', nome: 'Rafael Teixeira', horarioChegada: chegadaHa(55), prioridade: 'urgente' },
        { id: 'pac-207', nome: 'Isabela Martins', horarioChegada: chegadaHa(47), prioridade: 'normal' },
        { id: 'pac-208', nome: 'Gustavo Henrique Dias', horarioChegada: chegadaHa(38), prioridade: 'normal' },
        { id: 'pac-209', nome: 'Vanessa Ribeiro', horarioChegada: chegadaHa(30), prioridade: 'normal' },
        { id: 'pac-210', nome: 'Diego Fonseca', horarioChegada: chegadaHa(22), prioridade: 'urgente' },
        { id: 'pac-211', nome: 'Aline Barbosa', horarioChegada: chegadaHa(14), prioridade: 'normal' },
        { id: 'pac-212', nome: 'Thiago Moreira', horarioChegada: chegadaHa(6), prioridade: 'normal' },
      ],
    },
    {
      id: 'ubs-02',
      nome: 'UBS Vila Esperança',
      tipo: 'UBS',
      tempoMedioEsperaMin: 25,
      pacientes: [
        { id: 'pac-301', nome: 'Sandra Regina Pinto', horarioChegada: chegadaHa(48), prioridade: 'normal' },
        { id: 'pac-302', nome: 'Eduardo Campos', horarioChegada: chegadaHa(35), prioridade: 'normal' },
        { id: 'pac-303', nome: 'Letícia Andrade', horarioChegada: chegadaHa(20), prioridade: 'urgente' },
        { id: 'pac-304', nome: 'Paulo César Batista', horarioChegada: chegadaHa(8), prioridade: 'normal' },
      ],
    },
    {
      id: 'upa-02',
      nome: 'UPA Zona Norte',
      tipo: 'UPA',
      tempoMedioEsperaMin: 55,
      pacientes: [
        { id: 'pac-401', nome: 'Cristiane Lopes', horarioChegada: chegadaHa(90), prioridade: 'normal' },
        { id: 'pac-402', nome: 'Fábio Junqueira', horarioChegada: chegadaHa(72), prioridade: 'urgente' },
        { id: 'pac-403', nome: 'Renata Siqueira', horarioChegada: chegadaHa(58), prioridade: 'normal' },
        { id: 'pac-404', nome: 'André Luís Correia', horarioChegada: chegadaHa(41), prioridade: 'normal' },
        { id: 'pac-405', nome: 'Mariana Freitas', horarioChegada: chegadaHa(27), prioridade: 'urgente' },
        { id: 'pac-406', nome: 'Otávio Mendes', horarioChegada: chegadaHa(12), prioridade: 'normal' },
      ],
    },
  ];
}

module.exports = { buildSeed };
