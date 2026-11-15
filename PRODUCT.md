# Product

<!-- impeccable:product-schema 1 -->

Registro da verdade de produto do Sobramar para quem for desenhar ou construir este site. Tudo aqui
foi decidido pelo Rodrigo entre 07/11/2026 e 12/11/2026; o que ainda não foi decidido está marcado
como "em aberto". As decisões visuais ficam em `DESIGN.md`.

## Platform

web

## Users

- **Quem usa o produto.** Pessoa assalariada, de 28 a 45 anos, com dois cartões, de seis a dez
  parcelamentos ativos, aluguel ou financiamento. Às vezes um casal que divide a casa, mas não a
  conta. Não é quem está superendividado nem quem investe: é quem recebe e não sabe quanto é dele.
- **O trabalho.** "Quando estou prestes a assumir um compromisso, quero ver quanto do meu futuro já
  está vendido, para decidir sem medo e sem culpa." Um segundo, menor: "no dia do pagamento, quero
  saber quanto é realmente meu."
- **Quando dói.** No dia do pagamento e antes de parcelar. Hoje a pessoa resolve com planilha, bloco
  de notas e conta de cabeça.
- **Quem chega a este site.** Alguém que ainda não conhece o produto. Precisa entender numa tela o
  que é e para quem, ver um mês de exemplo e decidir se monta o próprio carnê no app.

## Product Purpose

O Sobramar mostra os próximos 12 meses como um carnê: uma folha por mês, com o que entra, o que sai
e o que sobra. Existe para que ninguém descubra em março o que decidiu em janeiro: a dívida é a soma
de pequenos parcelamentos, cada um razoável sozinho.

O produto dá certo quando alguém muda uma decisão de compra depois de ver os 12 meses. O indicador
do dia a dia é quantos dias se passaram desde a última atualização dos dados, porque uma sobra
desatualizada é uma sobra falsa.

Este site dá certo quando o visitante entende a ideia sem ajuda e segue para "Montar meu carnê".

## Positioning

Para quem recebe salário e parcela no cartão. Os apps de banco e os livros-caixa mostram o passado;
o Sobramar olha para a frente e mostra quanto dos próximos 12 meses já tem dono, sem se conectar à
conta e sem pedir senha de banco. Frase de referência: "Antes de comprar, veja o depois."

O que o produto não é: método de orçamento, conexão bancária, recomendação de investimento, jogo,
chatbot, juiz.

## Operating Context

- Três repositórios: este site (público, estático), o app (`sobramar-frontend`) e o backend
  (`sobramar-backend`). O site só aponta para o app; cadastro e login são do app.
- As palavras e os objetos do uso são os do dia a dia de quem parcela: salário, fatura, parcela,
  vale, 13º, carnê, folha, canhoto, carimbo "Pago", lápis e tinta.
- A leitura acontece no celular e no computador. O celular de referência é um Android de entrada.
- A máquina do Rodrigo pede menos movimento ao sistema: a página precisa de um botão visível para
  ligar o movimento, e precisa lembrar a escolha.

## Capabilities and Constraints

**O que o produto faz hoje (app e backend).** Projeção de 12 meses em centavos; modo lista simples;
cadastro "Montar meu carnê" (renda e dia do pagamento, cartão, contas fixas, parcelas em andamento);
folha do mês sobre tabela de verdade; sobra estimada ou firme, com o motivo escrito.

**Planejado e ainda não construído no app.** Virar a folha por arrasto, folha de prova (simular
antes de comprar), baixa com desfazer, importação de extrato. O site pode explicar essas ideias com
o exemplo, mas não as apresenta como prontas sem conferir o estado do app.

**Regras deste site.**

- Angular 22 com saída estática; sem backend próprio. GSAP e Lenis só carregam sob demanda.
- Os dados são só os da família fictícia de `src/app/features/inicio/dominio/exemplo.ts` e a
  projeção calculada a partir dela. Nenhum número é inventado na tela.
- Centavos sempre visíveis. Nenhum sinal de mais ou de menos: os blocos se chamam "Entra" e "Sai".
- Todo valor estimado leva o motivo na própria linha. Cor nunca é a única pista.
- Texto exato fica em HTML. Nenhum valor em reais dentro de vídeo gerado.
- A página conta a história inteira sem animação e sem JavaScript.
- Até 500 KB de JavaScript, fora fontes e mídia; Lighthouse 90 ou mais no celular.
- Preferir o que é gratuito. Nenhum serviço pago sem o sim do Rodrigo.

**Vocabulário.** "Dar baixa", nunca "pagar". "Sobra". "A lápis" para o estimado, "em tinta" para o
conferido. Cartão pelos quatro últimos dígitos ("cartão final 4321").

**Em aberto.**

- Endereço de produção do app (hoje `http://localhost:4200`, o que impede publicar).
- Hero final: o filme do Blender é provisório; o serviço que gera o definitivo é escolha do Rodrigo.
- Hospedagem gratuita (GitHub Pages ou Cloudflare Pages).
- Páginas de Privacidade e Termos próprias do site.
- Nome público: Sobramar por enquanto. "Folha" é o nome do conceito, não do produto.

## Brand Commitments

- **Nome:** Sobramar.
- **Voz:** frases curtas, palavras do dia a dia, centavos sempre. Sem exclamação, sem "você
  consegue", sem "fluxo de caixa", sem "premium", "poderoso", "inteligente" ou "simples e seguro".
  Sem promessa de IA. Sem "todos os direitos reservados". Os adjetivos da casa são "claro" e "calmo".
- **Postura:** vê, informa e não julga. Sobra negativa é "faltam R$ X neste mês", em tinta neutra.
- **Frases fixas:** "Montar meu carnê" (a ação principal, sempre com o mesmo nome e o mesmo destino)
  e "Sem senha de banco. O app não move dinheiro."
- **Objeto:** carnê de 12 folhas rígidas em leque, presas por um rebite no canhoto, com picote de
  bilhete. A folha do mês se destaca das outras.
- **Paleta e tipos:** escolhidos pelo Rodrigo em 11/11/2026; valores e papéis em `DESIGN.md`.
- **Descartado pelo Rodrigo:** madeira, marrom, foto de mesa e página parada como padrão.

## Evidence on Hand

- **A família fictícia:** março, abril e maio de 2027 em
  `src/app/features/inicio/dominio/exemplo.ts`. Maio fecha com sobra de R$ 2.680,10.
- **O carnê em 3D:** cena do Blender (visual `poente`) com filme de abertura de 2,5 s, quadro
  inicial, quadro final e enquadramento em retrato, em `public/hero/`. É imagem gerada por
  computador, e o fecho da página diz isso.
- **Teste de estigma (09/11/2026):** resultado favorável, com amostra menor que o protocolo. Serve
  de orientação interna; não é prova para citar no site.
- **O que não existe e não se inventa:** depoimentos, número de usuários, notas, selos, imprensa,
  preço.

## Product Principles

1. **O futuro antes do passado.** Cada tela responde quanto dos próximos meses já tem dono.
2. **Mostrar o grau de certeza.** O estimado aparece a lápis, com o motivo escrito; vira tinta
   quando a conta chega.
3. **Informar sem julgar.** Nada de alarme, vermelho na sobra ou conselho.
4. **O app não move dinheiro e não pede senha de banco.** Dizer isso onde a dúvida aparece.
5. **Completo sem enfeite.** A história fecha sem animação e sem JavaScript; o carnê é pele sobre
   uma tabela de verdade.

## Accessibility & Inclusion

- WCAG 2.2 nível AA. Contraste de texto calculado, de pelo menos 4,5:1.
- Teclado completo, foco visível, alvos de toque de 44 px ou mais.
- Menos movimento: a página respeita o pedido do sistema, oferece um botão visível para ligar o
  movimento e lembra a escolha. Sem movimento, ficam as trocas de cor e opacidade.
- A folha é uma `<table>` com `caption`, `th scope` e blocos "Entra" e "Sai".
- Conteúdo em português do Brasil (`lang="pt-BR"`).
