/**
 * A casa do exemplo: a família fictícia de `docs/exemplo-de-referencia.md`, no backend. Todos os
 * valores são inventados e ficam em centavos inteiros. O site mostra março, abril e maio de 2027
 * como se hoje fosse meados de maio: os dois primeiros já conferidos, o terceiro ainda a lápis.
 */
export type Situacao = 'pago' | 'previsto' | 'estimado';
export type Confianca = 'firme' | 'estimada';

export interface Lancamento {
  readonly descricao: string;
  readonly detalhe: string;
  readonly centavos: number;
  readonly situacao: Situacao;
}

export interface MesDoExemplo {
  readonly competencia: string;
  readonly nome: string;
  readonly curto: string;
  /** A posição da folha no carnê do ano: maio é a 5 de 12. */
  readonly numero: number;
  readonly entra: readonly Lancamento[];
  readonly sai: readonly Lancamento[];
  readonly confianca: Confianca;
  /** Diz o que falta para a sobra ficar firme, nunca a regra. */
  readonly estado: string;
  /** O que este mês tem de diferente, numa frase. */
  readonly nota: string;
}

const CARTAO = 'cartão final 4321';
const CONFERIDO = 'firme: tudo certo e conferido com o banco';

const salario = (situacao: Situacao): Lancamento => ({
  descricao: 'Salário',
  detalhe: 'dia 5',
  centavos: 500000,
  situacao,
});
const aluguel: Lancamento = {
  descricao: 'Aluguel',
  detalhe: 'dia 10',
  centavos: 150000,
  situacao: 'pago',
};
const luzPaga: Lancamento = {
  descricao: 'Luz',
  detalhe: 'dia 15',
  centavos: 18000,
  situacao: 'pago',
};

function noCartao(descricao: string, parcela: string, centavos: number, situacao: Situacao) {
  const detalhe = parcela ? `${parcela}, ${CARTAO}` : CARTAO;
  return { descricao, detalhe, centavos, situacao } satisfies Lancamento;
}

function curso(parcela: number, situacao: Situacao): Lancamento {
  return {
    descricao: 'Curso',
    detalhe: `parcela ${parcela} de 36, boleto`,
    centavos: 10000,
    situacao,
  };
}

export const MESES_DO_EXEMPLO: readonly MesDoExemplo[] = [
  {
    competencia: '2027-03',
    nome: 'Março de 2027',
    curto: 'Março',
    numero: 3,
    entra: [salario('pago')],
    sai: [
      aluguel,
      luzPaga,
      noCartao('Notebook', 'parcela 3 de 12', 30000, 'pago'),
      noCartao('Assinatura', '', 3990, 'pago'),
      curso(2, 'pago'),
      { descricao: 'IPVA', detalhe: 'dia 15, uma vez no ano', centavos: 120000, situacao: 'pago' },
    ],
    confianca: 'firme',
    estado: CONFERIDO,
    nota: 'O IPVA leva R$ 1.200,00 de uma vez e a sobra cai para R$ 1.680,10.',
  },
  {
    competencia: '2027-04',
    nome: 'Abril de 2027',
    curto: 'Abril',
    numero: 4,
    entra: [salario('pago')],
    sai: [
      aluguel,
      luzPaga,
      noCartao('Notebook', 'parcela 4 de 12', 30000, 'pago'),
      noCartao('Assinatura', '', 3990, 'pago'),
      curso(3, 'pago'),
    ],
    confianca: 'firme',
    estado: CONFERIDO,
    nota: 'Sem o IPVA, a sobra volta a R$ 2.880,10.',
  },
  {
    competencia: '2027-05',
    nome: 'Maio de 2027',
    curto: 'Maio',
    numero: 5,
    entra: [salario('pago')],
    sai: [
      aluguel,
      {
        descricao: 'Luz',
        detalhe: 'dia 15, estimado, a conta chega por volta do dia 12',
        centavos: 18000,
        situacao: 'estimado',
      },
      noCartao('Notebook', 'parcela 5 de 12', 30000, 'previsto'),
      noCartao('Geladeira', 'parcela 1 de 6', 20000, 'previsto'),
      noCartao('Assinatura', '', 3990, 'previsto'),
      curso(4, 'previsto'),
    ],
    confianca: 'estimada',
    estado: `estimado: Luz ainda sem valor certo e fatura do ${CARTAO} não conferida`,
    nota: 'A geladeira entra em 6 parcelas de R$ 200,00, e a luz ainda é estimativa.',
  },
];

function somar(lancamentos: readonly Lancamento[]): number {
  return lancamentos.reduce((total, lancamento) => total + lancamento.centavos, 0);
}

export function saidasCentavos(mes: MesDoExemplo): number {
  return somar(mes.sai);
}

export function sobraCentavos(mes: MesDoExemplo): number {
  return somar(mes.entra) - somar(mes.sai);
}

/** Centavos sempre visíveis, sem sinal: quem diz se entra ou sai é o bloco, não o número. */
export function emReais(centavos: number): string {
  const inteiro = Math.floor(centavos / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${inteiro},${String(centavos % 100).padStart(2, '0')}`;
}
