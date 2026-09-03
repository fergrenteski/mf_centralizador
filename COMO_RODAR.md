# Como rodar — Central de Filas

Guia passo a passo para rodar o projeto **localmente** e publicar em **produção**
(Azure). O sistema tem 3 partes:

```
Host (este repo, Vite)  ──abas──►  Remotes (App1 Painel / App2 Consulta)
        │
        └── botão "Popular banco" ──► Azure Functions ──► MongoDB Atlas
                                       (pasta functions/)   (open-prontuario)
```

- **Host** = este repositório (React + Vite + Module Federation).
- **Remotes** = outros dois repositórios, publicados no Azure Static Web Apps.
- **Backend** = Azure Functions (pasta [`functions/`](./functions)) com MongoDB.

---

## Pré-requisitos

| Ferramenta | Para quê | Instalar |
|-----------|----------|----------|
| **Node.js 20+** e **npm** | rodar host e functions | https://nodejs.org |
| Conta **MongoDB Atlas** + connection string | banco de dados | https://cloud.mongodb.com |
| **Azure Functions Core Tools v4** | rodar/publicar functions | `brew tap azure/functions && brew trust azure/functions && brew install azure-functions-core-tools@4` |
| **Azure CLI** (`az`) | criar/configurar recursos | `brew install azure-cli` |
| Conta **Azure** | hospedar em produção | https://portal.azure.com |

Confirme as versões:

```bash
node -v && npm -v
func --version   # deve ser 4.x
az version
```

---

# Parte 1 — Rodar LOCALMENTE

São **dois** processos: o backend (functions) e o frontend (host). Use dois terminais.

## 1.1 — Backend (Azure Functions) local

```bash
cd functions
npm install
```

Crie o arquivo de segredos local a partir do exemplo e preencha a connection string:

```bash
cp local.settings.json.example local.settings.json
```

Edite `functions/local.settings.json` e coloque sua `MONGODB_URI`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "MONGODB_URI": "mongodb+srv://<usuario>:<senha>@cha-db.inma7ex.mongodb.net/?retryWrites=true&w=majority&appName=cha-db",
    "MONGODB_DB": "furafila",
    "MONGODB_COLLECTION": "open-prontuario"
  },
  "Host": { "CORS": "*" }
}
```

> `local.settings.json` **não** é versionado (está no `.gitignore`) — nunca commite a senha.

Suba as functions:

```bash
npm start          # = func start  →  http://localhost:7071
```

Popule o banco (uma vez) e teste:

```bash
curl -X POST http://localhost:7071/api/seed
curl http://localhost:7071/api/fila
curl http://localhost:7071/api/fila/ubs-01/pacientes
```

## 1.2 — Frontend (host Vite)

Em **outro terminal**, na raiz do projeto:

```bash
npm install
cp .env.example .env      # já vem com VITE_FUNCTIONS_URL=http://localhost:7071
npm run dev               # http://localhost:3000
```

Abra **http://localhost:3000**. O botão **“Popular banco”** vai chamar
`http://localhost:7071/api/seed` (o backend do passo 1.1).

> Se a porta 3000 estiver ocupada: `npm run dev -- --port 5173`.

---

# Parte 2 — PRODUÇÃO (Azure)

## 2.1 — Criar o Azure Function App

Você pode **reaproveitar** um app existente (ex.: `furafila`) e pular para o 2.2,
ou **criar do zero**. Duas opções:

### Opção A — pela CLI (recomendado)

```bash
az login

# defina os nomes (APP_NAME precisa ser único no mundo; STORAGE: 3-24, minúsculas/números)
RG="rg-central-filas"
LOCAL="brazilsouth"
APP_NAME="furafila"
STORAGE="stcentralfilas$RANDOM"

az group create --name "$RG" --location "$LOCAL"

az storage account create --name "$STORAGE" --resource-group "$RG" \
  --location "$LOCAL" --sku Standard_LRS

az functionapp create --name "$APP_NAME" --resource-group "$RG" \
  --storage-account "$STORAGE" \
  --consumption-plan-location "$LOCAL" \
  --runtime node --runtime-version 20 --functions-version 4 \
  --os-type Linux
```

### Opção B — pelo Portal

1. [portal.azure.com](https://portal.azure.com) → **Create a resource** → **Function App**.
2. **Runtime stack:** Node.js · **Version:** 20 LTS · **OS:** Linux · **Plan:** Consumption.
3. **Region:** Brazil South. Crie/associe uma Storage Account. → **Review + create**.

## 2.2 — Publicar as functions

```bash
cd functions
npm install
func azure functionapp publish furafila     # troque pelo nome do seu app
```

No fim ele imprime as **Invoke URLs** (guarde o host, ex.:
`https://furafila-xxxx.brazilsouth-01.azurewebsites.net`).

## 2.3 — Configurar as variáveis no Function App

O `local.settings.json` **não sobe**. Configure na Azure (senão dá o erro
`MONGODB_URI não configurada`):

```bash
az functionapp config appsettings set --name furafila --resource-group "$RG" --settings \
  MONGODB_URI="mongodb+srv://<usuario>:<senha>@cha-db.inma7ex.mongodb.net/?retryWrites=true&w=majority&appName=cha-db" \
  MONGODB_DB="furafila" \
  MONGODB_COLLECTION="open-prontuario"
```

> Ou no Portal: Function App → **Settings → Environment variables → App settings**
> → adicione as três → **Apply** (reinicia o app).

## 2.4 — Liberar o MongoDB Atlas

No Atlas → **Network Access** → **Add IP Address** → `0.0.0.0/0`
(ou os *outbound IPs* do Function App). Sem isso o Atlas recusa a conexão da Azure.

## 2.5 — Popular o banco em produção

```bash
curl -X POST https://furafila-xxxx.brazilsouth-01.azurewebsites.net/api/seed
```

## 2.6 — Liberar CORS (para o navegador chamar a API)

O `fetch` do host (outra origem) só passa se o Function App permitir a origem:

```bash
az functionapp cors add --name furafila --resource-group "$RG" --allowed-origins \
  https://gray-water-019d50e10.5.azurestaticapps.net \
  http://localhost:3000
```

## 2.7 — Publicar o host (Static Web Apps)

O deploy do host já é automático: há um workflow em
[`.github/workflows/`](./.github/workflows) que publica a cada `push` na `main`.

**Importante:** o Vite embute a URL da API **no momento do build**. Para o botão
de seed apontar para produção, defina `VITE_FUNCTIONS_URL` no build do workflow.
Edite o passo *Build And Deploy* e acrescente:

```yaml
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        env:
          VITE_FUNCTIONS_URL: https://furafila-xxxx.brazilsouth-01.azurewebsites.net
        with:
          # ...resto igual...
          app_location: "/"
          output_location: "dist"
```

Depois:

```bash
git add . && git commit -m "config produção" && git push
```

Build manual local (se quiser gerar o `dist/` você mesmo):

```bash
VITE_FUNCTIONS_URL="https://furafila-xxxx.brazilsouth-01.azurewebsites.net" npm run build
```

---

## Referência — endpoints das functions

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/fila` | lista unidades (tamanho da fila + tempo médio) |
| GET | `/api/fila/{unidadeId}/pacientes` | fila da unidade (urgentes primeiro) |
| POST | `/api/fila/{unidadeId}/chamar-proximo` | chama e remove o próximo |
| POST | `/api/fila/{unidadeId}/pacientes` | adiciona paciente `{ nome, prioridade }` |
| POST | `/api/seed` | limpa e popula a collection |

## Referência — variáveis de ambiente

**Host (Vite) — arquivo `.env` na raiz:**

| Variável | Exemplo | Onde |
|----------|---------|------|
| `VITE_FUNCTIONS_URL` | `http://localhost:7071` (local) / `https://furafila-...azurewebsites.net` (prod) | `.env` local / `env:` do workflow em prod |

**Functions — `local.settings.json` (local) / App settings (Azure):**

| Variável | Padrão | Obrigatória |
|----------|--------|-------------|
| `MONGODB_URI` | — | ✅ |
| `MONGODB_DB` | `furafila` | não |
| `MONGODB_COLLECTION` | `open-prontuario` | não |
| `SEED_TOKEN` | *(vazio)* | não (se definir, exige token no `/api/seed`) |

---

## Problemas comuns

- **`MONGODB_URI não configurada`** → faltam as App settings no Function App (passo 2.3).
- **Erro de CORS no navegador** → libere a origem do host no Function App (passo 2.6).
- **Timeout / conexão recusada com o Mongo** → Atlas Network Access (passo 2.4).
- **Botão de seed some/erra em prod** → `VITE_FUNCTIONS_URL` não foi definido no build (passo 2.7). Lembre: é a **raiz** do app, sem `/api`.
- **`brew ... untrusted tap`** → rode `brew trust azure/functions` antes do install.
- **Porta 3000 ocupada** → `npm run dev -- --port 5173`.
