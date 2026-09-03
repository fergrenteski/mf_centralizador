# FuraFila — Azure Functions (backend MongoDB)

Backend real da **API de Fila de Atendimento UBS/UPA**, consumido pelos remotes
do `mf_principal`. Node.js v4 (JavaScript) + MongoDB Atlas.

Function App na Azure: **`furafila`**
Banco: `furafila` · Collection: **`open-prontuario`** (1 documento por unidade,
com os pacientes embutidos em `pacientes`).

## Endpoints

| Function                 | Método | Rota                                   | Descrição |
| ------------------------ | ------ | -------------------------------------- | --------- |
| `listarUnidadesComFila`  | GET    | `/api/fila`                            | Lista unidades com tamanho da fila e tempo médio |
| `listarPacientesDaFila`  | GET    | `/api/fila/{unidadeId}/pacientes`      | Fila da unidade (urgentes primeiro, depois chegada) |
| `chamarProximoPaciente`  | POST   | `/api/fila/{unidadeId}/chamar-proximo` | Chama e **remove** o próximo da fila |
| `adicionarPacienteNaFila`| POST   | `/api/fila/{unidadeId}/pacientes`      | **Inserir** paciente `{ nome, prioridade }` |
| `buscarPaciente`         | GET    | `/api/fila/{unidadeId}/pacientes/{pacienteId}` | **Pesquisar** um paciente |
| `alterarPaciente`        | PUT    | `/api/fila/{unidadeId}/pacientes/{pacienteId}` | **Alterar** nome/prioridade |
| `removerPaciente`        | DELETE | `/api/fila/{unidadeId}/pacientes/{pacienteId}` | **Excluir** um paciente |
| `seedDados`              | POST   | `/api/seed`                            | Limpa e popula a `open-prontuario` |

### CRUD de paciente (requisito PJBL)

| Operação | Function | Verbo + rota |
|----------|----------|--------------|
| **Inserir**   | `adicionarPacienteNaFila` | `POST /api/fila/{unidadeId}/pacientes` |
| **Pesquisar** | `buscarPaciente` / `listarPacientesDaFila` | `GET /api/fila/{unidadeId}/pacientes/{pacienteId}` (um) · `GET /api/fila/{unidadeId}/pacientes` (todos) |
| **Alterar**   | `alterarPaciente` | `PUT /api/fila/{unidadeId}/pacientes/{pacienteId}` |
| **Excluir**   | `removerPaciente` | `DELETE /api/fila/{unidadeId}/pacientes/{pacienteId}` |

> ⚠️ `adicionarPacienteNaFila` foi inferido para completar o fluxo (o APIDOG só
> documenta os 3 primeiros). Ajuste/remova quando o contrato final for definido.

## Rodar localmente

```bash
cd functions
npm install
# a connection string já está em local.settings.json (NÃO versionado)
npm start        # func start  → http://localhost:7071
```

Popular o banco e testar:

```bash
curl -X POST http://localhost:7071/api/seed
curl http://localhost:7071/api/fila
curl http://localhost:7071/api/fila/ubs-01/pacientes
curl -X POST http://localhost:7071/api/fila/ubs-01/chamar-proximo
curl -X POST http://localhost:7071/api/fila/ubs-01/pacientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"Novo Paciente","prioridade":"urgente"}'
```

CRUD de um paciente (troque `<PID>` pelo id retornado no insert):

```bash
# Pesquisar um paciente
curl http://localhost:7071/api/fila/ubs-01/pacientes/<PID>

# Alterar (nome e/ou prioridade)
curl -X PUT http://localhost:7071/api/fila/ubs-01/pacientes/<PID> \
  -H "Content-Type: application/json" \
  -d '{"prioridade":"normal"}'

# Excluir
curl -X DELETE http://localhost:7071/api/fila/ubs-01/pacientes/<PID>
```

## Deploy no app `furafila`

Pré-requisitos: [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local)
e `az login`.

```bash
cd functions
npm install
func azure functionapp publish furafila   # ou: npm run deploy
```

Depois configure as variáveis de ambiente **na Azure** (não sobem do
`local.settings.json`):

```bash
az functionapp config appsettings set --name furafila --resource-group <SEU_RG> --settings \
  MONGODB_URI="mongodb+srv://luizgrenfer:<senha>@cha-db.inma7ex.mongodb.net/?retryWrites=true&w=majority&appName=cha-db" \
  MONGODB_DB="furafila" \
  MONGODB_COLLECTION="open-prontuario"
```

Opcional: `SEED_TOKEN="algum-segredo"` para proteger o endpoint `/api/seed`
(passe em `x-seed-token` ou `?token=`).

> No **MongoDB Atlas**, libere o acesso de rede das Functions (Network Access →
> `0.0.0.0/0`, ou os IPs de saída do Function App).

## Configuração

| Variável             | Padrão            | Descrição |
| -------------------- | ----------------- | --------- |
| `MONGODB_URI`        | —                 | Connection string do Atlas (obrigatória) |
| `MONGODB_DB`         | `furafila`        | Nome do banco |
| `MONGODB_COLLECTION` | `open-prontuario` | Nome da collection |
| `SEED_TOKEN`         | *(vazio)*         | Se definido, exige token no `/api/seed` |
