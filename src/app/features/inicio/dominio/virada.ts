/**
 * A conta que liga a rolagem à virada das folhas. O progresso vai de 0 (primeira folha por cima) a
 * 1 (última folha por cima). Cada folha, menos a última, gira em torno do canhoto num trecho igual
 * do caminho. Ela fica opaca quase o giro todo e só some quando já está de perfil, para os textos
 * de duas folhas nunca se misturarem. As folhas de baixo esperam em leque: mais fundas, giradas,
 * mais escuras e fora de foco, e sobem uma posição a cada folha que vira por cima delas.
 */
export interface EstadoDaFolha {
  /** Graus em torno do canhoto: 0 de frente, negativo virando para quem olha. */
  readonly angulo: number;
  readonly opacidade: number;
  /** Quantas folhas ainda estão por cima, contando a que vira pela parte que falta girar. */
  readonly profundidade: number;
  readonly transform: string;
  readonly filtro: string;
}

/** De perfil: a folha nunca mostra o verso, então não precisa de segunda face. */
const ANGULO_FINAL = -88;
/** Parte do giro em que a folha ainda está inteira; só depois disso ela some. */
const INICIO_DO_SUMICO = 0.88;
/** Fração de cada trecho em que a folha fica parada, no começo e no fim, para dar tempo de ler. */
const REPOUSO = 0.15;
const METADE_DO_GIRO = 0.5;
/** Cada nível de profundidade: para a direita, para baixo, para trás, girado e menos nítido. */
const NIVEL = { x: 26, y: 16, z: -70, giro: 5, desfoque: 1.2 };
/** O primeiro nível escurece 20 %, os seguintes mais 10 % cada. */
const SOMBRA = { primeiro: 0.2, seguintes: 0.1 };
/** Quanto a folha escurece ao ficar de perfil, longe da luz. */
const SOMBRA_DO_GIRO = 0.14;

function limitar(valor: number): number {
  return Math.min(1, Math.max(0, valor));
}

/** Duas casas, e nunca "-0", que o estilo aceitaria mas os testes e os olhos estranham. */
function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100 || 0;
}

/** Acelera e desacelera dentro do trecho, para a folha assentar no mês (`power1.inOut` do GSAP). */
function suavizar(valor: number): number {
  return valor < 0.5 ? 2 * valor * valor : 1 - (-2 * valor + 2) ** 2 / 2;
}

/** Quanto a folha já virou, de 0 a 1. A última folha nunca vira. */
function giroDaFolha(progresso: number, indice: number, total: number): number {
  const viradas = total - 1;
  if (indice >= viradas) {
    return 0;
  }
  const noTrecho = limitar(progresso) * viradas - indice;
  return suavizar(limitar((noTrecho - REPOUSO) / (1 - 2 * REPOUSO)));
}

function brilho(profundidade: number, giro: number): number {
  const fundo =
    1 -
    SOMBRA.primeiro * Math.min(1, profundidade) -
    SOMBRA.seguintes * Math.max(0, profundidade - 1);
  return arredondar(fundo * (1 - SOMBRA_DO_GIRO * giro));
}

function estado(giro: number, profundidade: number): EstadoDaFolha {
  const angulo = arredondar(ANGULO_FINAL * giro);
  const d = arredondar(profundidade);
  return {
    angulo,
    opacidade: arredondar(1 - limitar((giro - INICIO_DO_SUMICO) / (1 - INICIO_DO_SUMICO))),
    profundidade: d,
    transform:
      `translate3d(${arredondar(NIVEL.x * d)}px, ${arredondar(NIVEL.y * d)}px, ` +
      `${arredondar(NIVEL.z * d)}px) rotate(${arredondar(NIVEL.giro * d)}deg) rotateY(${angulo}deg)`,
    filtro: `brightness(${brilho(d, giro)}) blur(${arredondar(NIVEL.desfoque * d)}px)`,
  };
}

export function estadoDasFolhas(progresso: number, total: number): EstadoDaFolha[] {
  const giros = Array.from({ length: total }, (_, indice) => giroDaFolha(progresso, indice, total));
  return giros.map((giro, indice) =>
    estado(
      giro,
      giros.slice(0, indice).reduce((soma, acima) => soma + 1 - acima, 0),
    ),
  );
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

/** A pilha chega deitada para trás e menor, e se levanta até ficar de frente quando a cena prende. */
const CHEGADA = { deitada: 24, abaixo: 70, tamanho: 0.9, perspectiva: 1600 };

/** O `transform` da pilha enquanto a seção sobe pela tela, de 0 (entrando por baixo) a 1 (presa). */
export function chegadaDaPilha(progresso: number): string {
  const falta = 1 - limitar(progresso);
  return (
    `perspective(${CHEGADA.perspectiva}px) translateY(${arredondar(CHEGADA.abaixo * falta)}px) ` +
    `rotateX(${arredondar(CHEGADA.deitada * falta)}deg) ` +
    `scale(${arredondar(1 - (1 - CHEGADA.tamanho) * falta)})`
  );
}
