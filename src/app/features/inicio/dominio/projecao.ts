/**
 * A projeção dos 12 meses de 2027 da casa do exemplo, a partir das regras de
 * `docs/exemplo-de-referencia.md` no backend. Tudo em centavos inteiros; os meses vão de 1 a 12.
 * As folhas de `exemplo.ts` são o recorte de março, abril e maio desta mesma conta, e os testes
 * garantem que as duas batem.
 */
export interface Regra {
  readonly nome: string;
  readonly centavos: number;
  /** Primeiro e último mês em que a regra vale, inclusive. */
  readonly de: number;
  readonly ate: number;
  /** Meses em que a regra vale outro valor. */
  readonly excecao?: Readonly<Record<number, number>>;
  /** Meses que a regra pula. */
  readonly fora?: readonly number[];
  /** Quantas parcelas a compra tem ao todo, quando é parcelada. */
  readonly parcelas?: number;
}

/** Meados de maio de 2027: o "hoje" do exemplo. */
export const HOJE = 5;
/** O maior valor que o simulador aceita, para a tabela nunca estourar: R$ 50.000,00. */
const TETO_DA_COMPRA = 5000000;

export const ENTRADAS: readonly Regra[] = [
  { nome: 'Salário', centavos: 500000, de: 1, ate: 12 },
  { nome: '13º', centavos: 250000, de: 11, ate: 12 },
];

export const SAIDAS: readonly Regra[] = [
  { nome: 'Aluguel', centavos: 150000, de: 1, ate: 12, excecao: { 1: 155000 } },
  { nome: 'Luz', centavos: 18000, de: 1, ate: 12, fora: [2] },
  { nome: 'Notebook', centavos: 30000, de: 1, ate: 12, parcelas: 12 },
  { nome: 'Geladeira', centavos: 20000, de: 5, ate: 10, parcelas: 6 },
  { nome: 'Assinatura', centavos: 3990, de: 2, ate: 12 },
  { nome: 'Curso', centavos: 10000, de: 2, ate: 12, parcelas: 36 },
  { nome: 'IPVA', centavos: 120000, de: 3, ate: 3 },
  { nome: 'Almoço avulso', centavos: 5000, de: 1, ate: 1 },
];

const MESES = Array.from({ length: 12 }, (_, indice) => indice + 1);

export function valorNoMes(regra: Regra, mes: number): number {
  if (mes < regra.de || mes > regra.ate || regra.fora?.includes(mes)) {
    return 0;
  }
  return regra.excecao?.[mes] ?? regra.centavos;
}

function somar(regras: readonly Regra[], mes: number): number {
  return regras.reduce((total, regra) => total + valorNoMes(regra, mes), 0);
}

export interface OpcoesDaProjecao {
  /** Saídas a mais, como a compra simulada. */
  readonly extras?: readonly Regra[];
  /** Nome de uma saída que fica fora da conta. */
  readonly sem?: string;
}

/** A sobra de cada mês, de janeiro a dezembro: o que entra menos o que sai. */
export function projetar({ extras = [], sem }: OpcoesDaProjecao = {}): number[] {
  const saidas = [...SAIDAS.filter((regra) => regra.nome !== sem), ...extras];
  return MESES.map((mes) => somar(ENTRADAS, mes) - somar(saidas, mes));
}

export interface Faixa {
  readonly de: number;
  readonly ate: number;
  readonly centavos: number;
}

/** Os trechos de meses seguidos com o mesmo valor: a luz pula fevereiro, o aluguel de janeiro foi outro. */
export function faixasDaRegra(regra: Regra): Faixa[] {
  return MESES.reduce<Faixa[]>((faixas, mes) => {
    const centavos = valorNoMes(regra, mes);
    const ultima = faixas.at(-1);
    if (!centavos) {
      return faixas;
    }
    if (ultima && ultima.ate === mes - 1 && ultima.centavos === centavos) {
      return [...faixas.slice(0, -1), { ...ultima, ate: mes }];
    }
    return [...faixas, { de: mes, ate: mes, centavos }];
  }, []);
}

/** Lê um valor escrito do jeito brasileiro ("1.800,00", "R$ 99,9"). O que não for valor vira zero. */
export function lerCentavos(texto: string): number {
  const limpo = texto.replace(/[^\d,]/g, '').replace(',', '.');
  const centavos = Math.round(Number.parseFloat(limpo) * 100);
  return Number.isFinite(centavos) && centavos > 0 ? Math.min(centavos, TETO_DA_COMPRA) : 0;
}

export interface MesSimulado {
  readonly mes: number;
  readonly parcela: number;
  readonly antes: number;
  readonly depois: number;
}

export interface Simulacao {
  readonly parcela: number;
  /** De junho a dezembro: os meses que a compra pode tocar neste carnê. */
  readonly meses: readonly MesSimulado[];
  /** Parcelas que caem em 2028, fora deste carnê. */
  readonly paraDepois: number;
}

/**
 * Uma compra no cartão feita hoje. O cartão fecha no dia 25 e vence no dia 5, então a primeira
 * parcela cai no mês seguinte. O resto da divisão entra na primeira parcela.
 */
export function simularCompra(totalCentavos: number, vezes: number): Simulacao {
  const parcela = Math.floor(totalCentavos / vezes);
  const resto = totalCentavos - parcela * vezes;
  const primeira = HOJE + 1;
  const ultima = Math.min(12, primeira + vezes - 1);
  const compra: Regra = {
    nome: 'Compra',
    centavos: parcela,
    de: primeira,
    ate: ultima,
    excecao: { [primeira]: parcela + resto },
  };
  const antes = projetar();
  const depois = projetar({ extras: totalCentavos ? [compra] : [] });
  return {
    parcela,
    meses: MESES.filter((mes) => mes >= primeira).map((mes) => ({
      mes,
      parcela: antes[mes - 1] - depois[mes - 1],
      antes: antes[mes - 1],
      depois: depois[mes - 1],
    })),
    paraDepois: vezes - (ultima - primeira + 1),
  };
}
