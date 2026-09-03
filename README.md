# Projeto PJBL — Sistema de Atendimento e Fila

> 🚀 **Como rodar (local e produção), passo a passo:** [`COMO_RODAR.md`](./COMO_RODAR.md)

## 👥 Integrantes do grupo

•⁠  ⁠Ana Paula Alvez
•⁠  ⁠Arthur Bertoni
•⁠  ⁠Bernardo Plottegher
•⁠  ⁠Luiz Fernando Grenteski

---

## 📌 Descrição do projeto

O projeto foi desenvolvido em grupo como parte da atividade PJBL, utilizando uma arquitetura baseada em *Module Federation*, com aplicações frontend independentes que se comunicam com dados mockados por meio de endpoints HTTP.

A solução possui aplicações independentes (*App 1* e *App 2) que futuramente serão integradas por meio de um **Centralizador/Host*.

As aplicações foram desenvolvidas utilizando *React JS* e publicadas no *Azure Static Web Apps*.

APP1: https://github.com/AnaBeluzzo/mf_portal_recep

APP2: https://github.com/arthurbertoni/mf_consulta_fila.git

APP CENTRAL: https://github.com/fergrenteski/mf_centralizador

---

# 🏗️ Arquitetura

O projeto utiliza *Module Federation*, permitindo que diferentes aplicações frontend sejam desenvolvidas e executadas de forma independente.

# LINKS AZURE

APP1:
https://thankful-sea-0e69b3a10.7.azurestaticapps.net/

APP2:
https://lively-ocean-057e5ab10.7.azurestaticapps.net

APP CENTRAL:
https://gray-water-019d50e10.5.azurestaticapps.net

### FUNCTIONS:

```
chamarProximoPaciente - [httpTrigger]
Invoke url: https://zerofilas-fpfwckceggbxfpcs.brazilsouth-01.azurewebsites.net/api/fila/{unidadeid}/chamar-proximo

listarPacientesDaFila - [httpTrigger]
    Invoke url: https://zerofilas-fpfwckceggbxfpcs.brazilsouth-01.azurewebsites.net/api/fila/{unidadeid}/pacientes

listarUnidadesComFila - [httpTrigger]
    Invoke url: https://zerofilas-fpfwckceggbxfpcs.brazilsouth-01.azurewebsites.net/api/fila
```

## Backend real (Azure Functions + MongoDB)

O código das Functions está em [`functions/`](./functions) — Node.js v4 (JS) com
persistência em **MongoDB Atlas** (collection `open-prontuario`). Substitui o mock
por dados reais e é publicado no Function App **`furafila`**.

Functions disponíveis:

| Método | Rota                                   | Function |
| ------ | -------------------------------------- | -------- |
| GET    | `/api/fila`                            | `listarUnidadesComFila` |
| GET    | `/api/fila/{unidadeId}/pacientes`      | `listarPacientesDaFila` |
| POST   | `/api/fila/{unidadeId}/chamar-proximo` | `chamarProximoPaciente` |
| POST   | `/api/fila/{unidadeId}/pacientes`      | `adicionarPacienteNaFila` — **inserir** |
| GET    | `/api/fila/{unidadeId}/pacientes/{pacienteId}` | `buscarPaciente` — **pesquisar** |
| PUT    | `/api/fila/{unidadeId}/pacientes/{pacienteId}` | `alterarPaciente` — **alterar** |
| DELETE | `/api/fila/{unidadeId}/pacientes/{pacienteId}` | `removerPaciente` — **excluir** |
| POST   | `/api/seed`                            | `seedDados` (popula a collection) |

Subir para o `furafila`:

```bash
cd functions
npm install
func azure functionapp publish furafila
```

Detalhes de configuração (variáveis de ambiente, seed, Atlas Network Access) em
[`functions/README.md`](./functions/README.md).

Estrutura planejada:

```text
                    ┌──────────────────────┐
                    │    Centralizador     │
                    │        Host          │
                    └──────────┬───────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
        ┌──────────────────┐      ┌──────────────────┐
        │      App 1       │      │      App 2       │
        │ Painel Atendente │      │ Consulta de Fila │
        │     Provider     │      │     Remote 1     │
        └────────┬─────────┘      └────────┬─────────┘
                 │                         │
                 └────────────┬────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Mock Backend   │
                    │  Azure Function  │
                    │      GET         │
                    └──────────────────┘
```
# MF Principal — Host (Module Federation)

Aplicação React (Webpack 5 Module Federation) que funciona como **host**, com
duas abas — cada uma renderiza um app remoto hospedado na Azure Static Apps.

## Rodar

```bash
npm install
npm start
```

Abre em http://localhost:3000

## Configurar os remotes

As URLs ficam no topo de [`webpack.config.js`](./webpack.config.js):

```js
const REMOTE_1_URL = "https://kind-beach-0aa0a8510.3.azurestaticapps.net";
const REMOTE_2_URL = "https://kind-beach-0aa0a8510.3.azurestaticapps.net";
```

## Contrato que o host espera de cada remote

Para as abas funcionarem, cada app remoto precisa expor um módulo via
Module Federation:

| Remote  | Nome (`name`) | Módulo exposto | Arquivo servido        |
| ------- | ------------- | -------------- | ---------------------- |
| Aba 1   | `app1`        | `./App`        | `/remoteEntry.js`      |
| Aba 2   | `app2`        | `./App`        | `/remoteEntry.js`      |

Exemplo do `ModuleFederationPlugin` no **remote 1**:

```js
new ModuleFederationPlugin({
  name: "app1",
  filename: "remoteEntry.js",
  exposes: { "./App": "./src/App" },
  shared: { react: { singleton: true }, "react-dom": { singleton: true } },
});
```

(No remote 2, troque `name` para `app2`.)

## Observações

- `react` e `react-dom` são compartilhados como `singleton` para evitar duas
  instâncias do React entre host e remotes.
- Um `ErrorBoundary` isola falhas: se um remote estiver fora do ar, só aquela
  aba mostra erro, sem derrubar o host.
