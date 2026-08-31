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
