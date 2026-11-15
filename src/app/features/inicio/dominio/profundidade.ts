/** Até onde a cena e o texto se deslocam, em pixels, quando o ponteiro chega à borda da dobra. */
const CENA = { x: 14, y: 10 };
const TEXTO = { x: 6, y: 4 };
/** A mesma ampliação que a cena já tem em repouso (`hero.scss`): o ponteiro só desloca, nunca amplia. */
const FOLGA_DA_CENA = 1.03;

export interface Profundidade {
  readonly cena: string;
  readonly texto: string;
}

/**
 * Profundidade pelo ponteiro: a cena e o texto andam alguns pixels em sentidos opostos, o bastante
 * para separar os dois planos. Recebe a posição do ponteiro dentro da dobra, de 0 a 1 em cada eixo
 * (0,5 é o centro), e devolve os dois `transform`.
 */
export function profundidade(x: number, y: number): Profundidade {
  const dx = doCentro(x);
  const dy = doCentro(y);
  return {
    cena: `scale(${FOLGA_DA_CENA}) translate(${pixels(-dx * CENA.x)}, ${pixels(-dy * CENA.y)})`,
    texto: `translate(${pixels(dx * TEXTO.x)}, ${pixels(dy * TEXTO.y)})`,
  };
}

/** Distância até o centro, de -0,5 a 0,5. Posição que não é número conta como o centro. */
function doCentro(posicao: number): number {
  return Number.isFinite(posicao) ? Math.min(1, Math.max(0, posicao)) - 0.5 : 0;
}

function pixels(valor: number): string {
  return `${Math.round(valor * 10) / 10 || 0}px`;
}
