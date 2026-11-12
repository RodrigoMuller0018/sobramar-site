/**
 * A conta que liga a rolagem à virada das folhas. O progresso vai de 0 (primeira folha por cima) a
 * 1 (última folha por cima). Cada folha, menos a última, gira em torno da lombada num trecho igual
 * do caminho e some no fim do giro, para não cobrir o texto ao lado.
 */
export interface EstadoDaFolha {
  /** Graus em torno da lombada: 0 deitada, negativo virando para a esquerda. */
  readonly angulo: number;
  readonly opacidade: number;
}

/** De perfil: a folha nunca mostra o verso, então não precisa de segunda face. */
const ANGULO_FINAL = -88;
/** Parte do giro em que a folha ainda está inteira; depois disso ela vai sumindo. */
const INICIO_DO_SUMICO = 0.55;
/** Fração de cada trecho em que a folha fica parada, no começo e no fim, para dar tempo de ler. */
const REPOUSO = 0.15;
const METADE_DO_GIRO = 0.5;

function limitar(valor: number): number {
  return Math.min(1, Math.max(0, valor));
}

/** Duas casas, e nunca "-0", que o estilo aceitaria mas os testes e os olhos estranham. */
function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100 || 0;
}

/** Quanto a folha já virou, de 0 a 1. A última folha nunca vira. */
function giroDaFolha(progresso: number, indice: number, total: number): number {
  const viradas = total - 1;
  if (indice >= viradas) {
    return 0;
  }
  const noTrecho = limitar(progresso) * viradas - indice;
  return limitar((noTrecho - REPOUSO) / (1 - 2 * REPOUSO));
}

export function estadoDasFolhas(progresso: number, total: number): EstadoDaFolha[] {
  return Array.from({ length: total }, (_, indice) => {
    const giro = giroDaFolha(progresso, indice, total);
    return {
      angulo: arredondar(ANGULO_FINAL * giro),
      opacidade: arredondar(1 - limitar((giro - INICIO_DO_SUMICO) / (1 - INICIO_DO_SUMICO))),
    };
  });
}

/** A folha que está por cima: a primeira que ainda não passou da metade do giro. */
export function folhaAtiva(progresso: number, total: number): number {
  const viradas = Array.from({ length: total }, (_, indice) =>
    giroDaFolha(progresso, indice, total),
  ).filter((giro) => giro >= METADE_DO_GIRO).length;
  return Math.min(viradas, total - 1);
}

/** O ponto da rolagem em que a folha repousa por cima, para os botões de mês levarem até lá. */
export function progressoDaFolha(indice: number, total: number): number {
  return total > 1 ? indice / (total - 1) : 0;
}
