---
title: API de Fila de Atendimento UBS/UPA (Mock)
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# API de Fila de Atendimento UBS/UPA (Mock)

API mock consumida pelas duas telas do projeto: a tela de Consulta de Fila (visão do cidadão) e o Painel do Atendente. Os dados retornados são estáticos/mockados, sem persistência real, conforme escopo do PJBL.

Base URLs:

# Authentication

# Raiz/Fila

<a id="opIdlistarUnidadesComFila"></a>

## GET Lista as unidades de saúde com o status atual da fila

GET /fila

Usado pela tela de Consulta de Fila (Remote 1) para exibir a lista de UBS/UPA com o tamanho da fila e o tempo médio de espera.

> Response Examples

> Lista de unidades retornada com sucesso

```json
[
    {
        "id": "ubs-01",
        "nome": "UBS Jardim das Flores",
        "tipo": "UBS",
        "tamanhoFila": 8,
        "tempoMedioEsperaMin": 35
    },
    {
        "id": "upa-01",
        "nome": "UPA Central",
        "tipo": "UPA",
        "tamanhoFila": 21,
        "tempoMedioEsperaMin": 70
    }
]
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Lista de unidades retornada com sucesso|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|*anonymous*|[[UnidadeSaude](#schemaunidadesaude)]|false|none||none|
|» id|string|true|none||none|
|» nome|string|true|none||none|
|» tipo|string|true|none||none|
|» tamanhoFila|integer|true|none||none|
|» tempoMedioEsperaMin|integer|true|none||none|

#### Enum

|Name|Value|
|---|---|
|tipo|UBS|
|tipo|UPA|

# Raiz/Atendente

<a id="opIdlistarPacientesDaFila"></a>

## GET Lista os pacientes aguardando atendimento em uma unidade

GET /fila/{unidadeId}/pacientes

Usado pelo Painel do Atendente (Remote 2) para exibir a fila operacional de uma unidade específica.

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|unidadeId|path|string| yes |Identificador da unidade de saúde (UBS ou UPA)|

> Response Examples

> Lista de pacientes na fila da unidade

```json
[
    {
        "id": "pac-101",
        "nome": "Maria Souza",
        "horarioChegada": "2026-08-27T08:15:00-03:00",
        "prioridade": "normal"
    },
    {
        "id": "pac-102",
        "nome": "João Pereira",
        "horarioChegada": "2026-08-27T08:20:00-03:00",
        "prioridade": "urgente"
    }
]
```

> 404 Response

```json
{
  "codigo": "UNIDADE_NAO_ENCONTRADA",
  "mensagem": "Nenhuma unidade encontrada com o id informado."
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Lista de pacientes na fila da unidade|Inline|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Unidade não encontrada|[Erro](#schemaerro)|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|*anonymous*|[[PacienteFila](#schemapacientefila)]|false|none||none|
|» id|string|true|none||none|
|» nome|string|true|none||none|
|» horarioChegada|string(date-time)|true|none||none|
|» prioridade|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|prioridade|normal|
|prioridade|urgente|

HTTP Status Code **404**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» codigo|string|true|none||none|
|» mensagem|string|true|none||none|

<a id="opIdchamarProximoPaciente"></a>

## POST Chama o próximo paciente da fila, respeitando a prioridade

POST /fila/{unidadeId}/chamar-proximo

Usado pelo Painel do Atendente (Remote 2) ao clicar em "Chamar próximo". Em ambiente mock, apenas retorna o paciente selecionado sem persistir a alteração.

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|unidadeId|path|string| yes |Identificador da unidade de saúde (UBS ou UPA)|

> Response Examples

> Paciente chamado com sucesso

```json
{
    "id": "pac-102",
    "nome": "João Pereira",
    "horarioChegada": "2026-08-27T08:20:00-03:00",
    "prioridade": "urgente"
}
```

> 404 Response

```json
{
  "codigo": "UNIDADE_NAO_ENCONTRADA",
  "mensagem": "Nenhuma unidade encontrada com o id informado."
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Paciente chamado com sucesso|[PacienteFila](#schemapacientefila)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Não há pacientes aguardando nesta unidade|[Erro](#schemaerro)|

# Data Schema

<h2 id="tocS_UnidadeSaude">UnidadeSaude</h2>

<a id="schemaunidadesaude"></a>
<a id="schema_UnidadeSaude"></a>
<a id="tocSunidadesaude"></a>
<a id="tocsunidadesaude"></a>

```json
{
  "id": "ubs-01",
  "nome": "UBS Jardim das Flores",
  "tipo": "UBS",
  "tamanhoFila": 8,
  "tempoMedioEsperaMin": 35
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|string|true|none||none|
|nome|string|true|none||none|
|tipo|string|true|none||none|
|tamanhoFila|integer|true|none||none|
|tempoMedioEsperaMin|integer|true|none||none|

#### Enum

|Name|Value|
|---|---|
|tipo|UBS|
|tipo|UPA|

<h2 id="tocS_PacienteFila">PacienteFila</h2>

<a id="schemapacientefila"></a>
<a id="schema_PacienteFila"></a>
<a id="tocSpacientefila"></a>
<a id="tocspacientefila"></a>

```json
{
  "id": "pac-101",
  "nome": "Maria Souza",
  "horarioChegada": "2026-08-27T08:15:00-03:00",
  "prioridade": "normal"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|string|true|none||none|
|nome|string|true|none||none|
|horarioChegada|string(date-time)|true|none||none|
|prioridade|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|prioridade|normal|
|prioridade|urgente|

<h2 id="tocS_Erro">Erro</h2>

<a id="schemaerro"></a>
<a id="schema_Erro"></a>
<a id="tocSerro"></a>
<a id="tocserro"></a>

```json
{
  "codigo": "UNIDADE_NAO_ENCONTRADA",
  "mensagem": "Nenhuma unidade encontrada com o id informado."
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|codigo|string|true|none||none|
|mensagem|string|true|none||none|

