---
name: Sobramar (site)
description: O carnê dos próximos 12 meses num campo noite, com um objeto 3D e uma única cor de ação.
colors:
  noite: '#0b132b'
  marinho: '#1c2541'
  ardosia: '#3a506b'
  azul-ceu: '#5bc0de'
  creme: '#f4d6b0'
  ambar: '#d97706'
  ambar-claro: '#e88a1a'
  texto: '#fbeedc'
  texto-suave: '#c3cde0'
typography:
  display:
    fontFamily: 'Instrument Serif, Reserva da Serifa, Iowan Old Style, Georgia, serif'
    fontSize: 'clamp(2.5rem, 11vw, 4.25rem)'
    fontWeight: 400
    lineHeight: 1
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'Instrument Serif, Reserva da Serifa, Iowan Old Style, Georgia, serif'
    fontSize: 'clamp(1.875rem, 3.34vw, 3rem)'
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: '-0.02em'
  lead:
    fontFamily: 'Onest Variable, Segoe UI, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: 'Onest Variable, Segoe UI, system-ui, sans-serif'
    fontSize: '1.0625rem'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'Onest Variable, Segoe UI, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: '0.14em'
rounded:
  p: '10px'
  m: '14px'
  g: '18px'
spacing:
  margem-celular: '24px'
  margem-tablet: '48px'
  margem-computador: '80px'
  barra: '72px'
  entre-botoes: '12px'
  entre-blocos: '24px'
components:
  botao-principal:
    backgroundColor: '{colors.ambar}'
    textColor: '{colors.noite}'
    rounded: '{rounded.m}'
    height: '48px'
    padding: '0 22px'
  botao-principal-hover:
    backgroundColor: '{colors.ambar-claro}'
    textColor: '{colors.noite}'
  botao-quieto:
    backgroundColor: 'transparent'
    textColor: '{colors.texto}'
    rounded: '{rounded.m}'
    height: '48px'
    padding: '0 22px'
  botao-pequeno:
    rounded: '{rounded.m}'
    height: '44px'
    padding: '0 16px'
  controle:
    backgroundColor: '{colors.noite}'
    textColor: '{colors.texto}'
    rounded: '{rounded.p}'
    height: '44px'
    padding: '0 14px'
  folha:
    backgroundColor: '{colors.creme}'
    textColor: '{colors.noite}'
---

# Design System: Sobramar (site)

## Overview

**Creative North Star: "O Carnê ao Poente"**

A página é um campo de noite com um único objeto iluminado: o carnê de doze folhas, aberto em
leque, com um brilho âmbar à esquerda e um azul-céu à direita, como o fim de tarde visto de dentro
de casa. A folha do mês, em creme, é o ponto mais claro de cada tela. Todo o resto é tipografia:
uma serifa calma nos títulos e nos números grandes, e a Onest no que se lê.

O tom é o de um instrumento que informa e não julga. Nada pisca, nada comemora, nada assusta. O
movimento existe para mostrar o objeto e a passagem dos meses, uma ideia por seção, e a página
conta a mesma história parada.

O que o Rodrigo descartou e não volta: madeira, marrom, foto de mesa, página parada como padrão.

**Key Characteristics:**

- Campo escuro contínuo; o creme só aparece como papel de folha.
- Um objeto em 3D como herói, com o texto exato sempre em HTML por cima.
- Uma única cor de ação, o âmbar, sempre com texto noite.
- Uma ideia por tela, um movimento próprio por seção.
- Valores com centavos, em algarismos tabulares, sem sinal de mais ou de menos.

## Colors

Seis cores escolhidas pelo Rodrigo em 11/11/2026, três marinhos para o campo e três tons quentes e
claros para o que importa, mais dois neutros de texto derivados delas.

### Primary

- **Âmbar de Ação** (`ambar`): a única cor de ação. Preenche o botão principal e o canhoto da folha
  do mês. No hover clareia para `ambar-claro`. Texto sobre âmbar é sempre noite (5,77:1; branco
  daria 3,19:1).

### Secondary

- **Azul-céu** (`azul-ceu`): ênfase. O trecho em itálico do título, o anel de foco, o que precisa
  de destaque sem ser ação. Sobre noite dá 8,79:1. Texto sobre azul-céu é sempre noite (branco
  daria 2,09:1).

### Tertiary

- **Creme de Papel** (`creme`): o papel da folha, e só ele. Com tinta noite dá 13,21:1; com ardósia
  (o lápis) dá 5,94:1.

### Neutral

- **Noite** (`noite`): o campo da página, a barra depois da rolagem e a tinta sobre o papel.
- **Marinho** (`marinho`): superfícies que precisam se separar do campo, como o fecho, e o carimbo
  "Pago" sobre o creme (10,86:1).
- **Ardósia** (`ardosia`): o lápis sobre o papel (valores estimados e rótulos da folha) e a barra de
  rolagem. Não serve para texto sobre noite (2,22:1).
- **Texto** (`texto`): texto principal sobre noite (16,08:1) e sobre marinho (13,21:1).
- **Texto suave** (`texto-suave`): texto de apoio sobre noite (11,49:1) e sobre marinho (9,44:1).

### Named Rules

**A Regra do Papel.** Creme é papel de folha. Nunca é fundo de página, de seção ou de botão.

**A Regra da Ação Única.** Âmbar só aparece onde se age (o botão principal) e no canhoto da folha.
Em cada tela há no máximo um botão âmbar à vista.

**A Regra dos Brilhos.** Os brilhos âmbar e azul-céu existem só dentro do render do carnê. Nenhum
gradiente decorativo é pintado em CSS. O véu sobre o filme é noite com transparência, e está ali
para o texto ser lido e para a dobra se fundir com a seção seguinte.

**A Regra da Segunda Pista.** Cor nunca é a única pista: o estimado leva o motivo escrito, o botão
de movimento diz por escrito se está ligado ou desligado, o foco tem anel.

## Typography

**Display Font:** Instrument Serif, peso 400, com itálico para o destaque (com Iowan Old Style e
Georgia de reserva)
**Body Font:** Onest Variable (com Segoe UI e system-ui de reserva)
**Label/Mono Font:** não há; rótulos e valores em Onest, com algarismos tabulares

**Reserva:** "Reserva da Serifa" não é um tipo novo. É a Georgia do sistema com a largura ajustada
(75,5 %) para ocupar o mesmo espaço da Instrument Serif enquanto ela carrega, sem a página pular.

**Character:** a serifa dá ao número a calma de coisa impressa; a Onest diz o resto sem chamar
atenção. Juntas parecem um documento bem feito, não um painel.

### Hierarchy

- **Display** (400, de 2.5rem a 4.25rem, 1): o título da primeira dobra. No celular vale
  `clamp(2.5rem, 11vw, 4rem)`; na tela larga é o maior tamanho que cabe em duas linhas na coluna à
  esquerda do carnê (a largura da coluna dividida por 6,8), até 4.25rem.
- **Headline** (400, `clamp(1.875rem, 3.34vw, 3rem)`, 1.08): o título de cada seção e a sobra da
  folha.
- **Lead** (400, 1.125rem, 1.5): a frase que acompanha um título. No máximo 34 em de largura.
- **Body** (400, 1.0625rem, 1.6): texto corrido, no máximo 65 caracteres por linha.
- **Label** (600, 0.75rem, 0.14em, caixa alta): rótulos da folha ("Entra", "Sai", "Sobra").

### Named Rules

**A Regra das Duas Linhas.** Nenhum título passa de duas linhas, em nenhuma largura. Usa
`text-wrap: balance`.

**A Regra dos Centavos.** Todo valor aparece com centavos e em `tabular-nums`. R$ 2.680,10, nunca
R$ 2.680.

## Layout

Uma largura só para a barra, todas as seções e o fecho: `min(100% - 2 × margem, 1440px)`, com
margem de 80 px no computador, 48 px abaixo de 1024 px e 24 px abaixo de 640 px. As margens
esquerda e direita são sempre iguais. Dentro dela, uma grade de 12 colunas com 24 px de calha.

Cada seção é uma tela (`100svh`) e uma ideia. A barra é fixa e tem 72 px (56 px no celular).

A primeira dobra tem três arranjos, escolhidos só pelo CSS:

- **Larga** (pelo menos 1240 px de largura e proporção de 3:2 ou mais): o filme cobre a tela, o
  carnê começa em 37,8 % da largura e o texto ocupa a coluna à esquerda dele, centrado na altura.
  O filme para de crescer em 1920 px; além disso as laterais somem no campo.
- **Lado a lado** (a partir de 1000 px, quando o arranjo largo não vale): o texto à esquerda e o
  retrato parado ocupando a direita da dobra, de cima a baixo.
- **Empilhada** (abaixo de 1000 px): o texto vem primeiro e o retrato parado ocupa o que sobra da
  primeira tela. No celular os dois botões dividem a largura, lado a lado.

A coluna de leitura fica à esquerda e o objeto à direita. Nada é centralizado na página.

## Elevation & Depth

A profundidade vem do render, não de sombras de interface: o carnê tem luz, sombra e perspectiva
próprias, e a página fica plana em volta dele. Na tela larga, o ponteiro desloca a cena e o texto
alguns pixels em sentidos opostos, o bastante para separar os dois planos.

### Shadow Vocabulary

- **Sombra do botão principal** (`box-shadow: 0 14px 28px -16px rgb(0 0 0 / 80%)`): solta o âmbar do
  campo; cresce um pouco no hover.
- **Sombra do papel** (`box-shadow: 0 1.1em 2.5em rgb(0 0 0 / 35%)`): só sob a folha em HTML.

### Named Rules

**A Regra do Plano.** Nada de vidro, `backdrop-filter` ou sombra colorida. Superfície de interface é
cor chapada.

## Shapes

Cantos arredondados e firmes, como os do carnê: 14 px nos botões, 10 px nos controles pequenos,
18 px reservados para superfícies grandes. Bordas de 1 px em creme translúcido: 44 % onde a borda
desenha um controle (3:1 sobre a noite), 16 % onde só separa. O picote tracejado do bilhete é a
única linha decorativa, e só existe na folha.

## Components

### Buttons

Firmes e calmos: respondem ao toque encolhendo um pouco, sem brilho.

- **Shape:** cantos de 14 px, 48 px de altura (44 px na barra), Onest 600.
- **Primary:** fundo âmbar, texto noite, sombra curta. É "Montar meu carnê" em toda a página, com o
  mesmo destino.
- **Quiet:** sem fundo, borda creme a 44 %, texto claro. Para a segunda ação ("Ver as folhas").
- **Hover / Focus:** o âmbar clareia; o quieto ganha um véu creme de 8 %. Hover só em
  `@media (hover: hover)`. Foco com anel azul-céu de 2 px, afastado 3 px.
- **Press:** `scale(0.97)` em 160 ms com `cubic-bezier(0.16, 1, 0.3, 1)`.

### Controls

Os botões pequenos do canto da primeira dobra. Fundo noite a 72 %, borda creme a 44 %, cantos de
10 px, 44 px de altura, Onest 500 em 0.875rem. O de movimento é um botão de alternância
(`aria-pressed`): diz "Movimento ligado" ou "Movimento desligado" e traz uma luz azul-céu, cheia
quando ligado; a escolha fica guardada no navegador. "Repetir a abertura" aparece na tela larga
depois que o texto entrou. Fora da tela larga, o de movimento só aparece quando o movimento está
desligado ou quando o sistema pede menos movimento.

### Navigation

A barra fixa: a marca em Instrument Serif à esquerda; "Folhas", "Entrar" e "Montar meu carnê" à
direita. Sobre a primeira dobra é transparente e o botão é quieto; com a rolagem ganha fundo noite e
uma linha e, quando o botão da dobra sai de vista (60 % de uma tela), o da barra passa a âmbar. Sem
blur, sem encolher, sem esconder. Abaixo de 640 px some o link "Folhas", e o botão só aparece depois que o da dobra saiu de vista. Um atalho "Pular para o conteúdo" aparece com
o foco do teclado.

### A primeira dobra

O filme do carnê toca uma vez. Quando a folha do mês assenta, o texto entra em sequência: opacidade,
18 px de subida e 6 px de desfoque, 900 ms, 90 ms entre itens, sempre com `cubic-bezier(0.16, 1,
0.3, 1)`. Sem movimento, sem JavaScript ou se o filme falhar, o quadro final e o texto aparecem
prontos. O ativo (filme, quadro inicial, quadro final, retrato e o segundo em que o texto entra) é
uma configuração só, para o hero definitivo entrar sem mexer no resto.

### A folha

Papel creme com tinta noite sobre uma `<table>` de verdade: `caption` com o mês, blocos "Entra" e
"Sai", valores sem sinal alinhados à direita, a sobra grande embaixo. O estimado aparece em ardósia
com o motivo escrito na linha. O carimbo "Pago" é um contorno marinho, levemente torto.

## Do's and Don'ts

### Do:

- **Do** usar noite como campo de toda a página e creme só como papel de folha.
- **Do** pôr texto noite sobre âmbar e sobre azul-céu, sempre.
- **Do** manter o texto exato em HTML por cima do render; valor em reais nunca vai dentro de vídeo.
- **Do** dar a cada seção um movimento próprio, feito só com `transform`, `opacity`, `clip-path` e
  `filter`, e um equivalente parado.
- **Do** respeitar o pedido de menos movimento do sistema e deixar à vista o botão que liga o
  movimento e lembra a escolha.
- **Do** manter interface abaixo de 300 ms e entradas com `cubic-bezier(0.16, 1, 0.3, 1)`.

### Don't:

- **Don't** usar madeira, marrom ou foto de mesa.
- **Don't** pintar gradiente decorativo, vidro, `backdrop-filter`, sombra colorida ou texto com
  gradiente.
- **Don't** usar texto branco sobre âmbar (3,19:1) nem sobre azul-céu (2,09:1).
- **Don't** usar cartões com ícone, emoji como marcador, numeração 01/02/03 sem sequência real,
  depoimentos ou contadores inventados.
- **Don't** usar `ease-in`, nem repetir a mesma entrada em todas as seções.
- **Don't** pôr sinal de mais ou de menos nos valores, nem vermelho na sobra.
