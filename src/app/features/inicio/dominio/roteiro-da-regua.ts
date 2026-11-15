/**
 * Os tempos da régua dos 12 meses, em milissegundos, para o componente só executar. A entrada risca
 * cada faixa da esquerda para a direita, uma linha depois da outra; depois a faixa da geladeira se
 * estende de maio a outubro, e a sobra de cada mês troca no instante em que a ponta dela passa pelo
 * meio do mês.
 */
export const RISCO = 550;
export const ENTRE_FAIXAS = 50;
/** A geladeira começa quando a penúltima faixa ainda está terminando de riscar. */
const SOBREPOSICAO = 250;
export const ESTENDER = 900;
export const ASSENTAR = 300;
/** A faixa chega levantada e assenta na linha 200 ms antes de acabar de se estender. */
export const INICIO_DO_ASSENTO = 700;
export const SAIR_O_NUMERO = 80;
export const ENTRAR_O_NUMERO = 260;
/** O nome do mês fica aceso um pouco depois do último número trocar. */
const APAGAR_DEPOIS = 500;

export interface Troca {
  /** Índice do mês, de 0 (janeiro) a 11. */
  readonly mes: number;
  readonly em: number;
}

export interface RoteiroDaRegua {
  /** Atraso de cada faixa comum. Vazio quando só a geladeira se repete. */
  readonly faixas: readonly number[];
  readonly geladeira: number;
  readonly trocas: readonly Troca[];
  /** Quando os nomes dos meses apagam e tudo termina. */
  readonly fim: number;
}

/**
 * A faixa se estende com a curva `power2.out`, 1 − (1 − t)³. Para saber quando a ponta chega a
 * uma fração `x` do caminho, inverte-se a curva: t = 1 − ∛(1 − x).
 */
function quandoChega(fracao: number): number {
  return 1 - Math.cbrt(1 - fracao);
}

/**
 * @param faixas quantas faixas comuns há para riscar; 0 quando só a geladeira se repete.
 * @param primeira índice do primeiro mês da geladeira (maio é 4).
 * @param parcelas em quantos meses ela se espalha.
 */
export function roteiroDaRegua(faixas: number, primeira: number, parcelas: number): RoteiroDaRegua {
  const atrasos = Array.from({ length: faixas }, (_, indice) => indice * ENTRE_FAIXAS);
  const geladeira = faixas ? Math.max(0, RISCO - SOBREPOSICAO + (faixas - 1) * ENTRE_FAIXAS) : 0;
  const trocas = Array.from({ length: parcelas }, (_, indice) => ({
    mes: primeira + indice,
    em: Math.round(geladeira + ESTENDER * quandoChega((indice + 0.5) / parcelas)),
  }));
  const ultima = trocas.at(-1)?.em ?? geladeira;
  return {
    faixas: atrasos,
    geladeira,
    trocas,
    fim: Math.max(geladeira + ESTENDER, ultima + SAIR_O_NUMERO + ENTRAR_O_NUMERO) + APAGAR_DEPOIS,
  };
}
