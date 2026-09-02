## APP1:
Evento_UBS_UPA_(Mock)_(1).md
crie um aplicativo react js puro, deve ter module Federation, no caso do meu é o provider.

"Painel do Atendente"
O que faz: a recepção vê a lista de pacientes na fila (mock) e "chama" o próximo.
Tabela com paciente, horário de chegada, prioridade
Botão "Chamar próximo" (pode simular a remoção da lista localmente, sem precisar de POST real)
Um contador simples: "X pacientes aguardando"

npm create module-federation@latest

## APP2:
cria um aplicativo react  js  puro, deve ter module federation , no caso do meu, e o provedor  Remote 1 — "Consulta de Fila" (visão do cidadão)
O que faz: o paciente digita o nome da UBS (ou escolhe da lista) e vê o status da fila.
Lista de unidades com tamanho da fila e tempo médio de espera (consome o GET mock)
Destaque visual pra unidade "sugerida" (a de referência, ou a mais próxima)
Um botão "Estou a caminho" (pode só mudar um estado local — não precisa persistir de verdade, já que o requisito mínimo é só GET)
Por que funciona bem como remote isolado: não depende de nada do "Remote 2" pra existir — é uma tela 100% autocontida, só recebe dados via fetch.  use esse comando npm create module-federation@latest

## APP CENTRAL:

