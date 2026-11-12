import { InjectionToken } from '@angular/core';

/** Uma seção cuja animação é comandada pela posição da rolagem. */
export interface CenaDeRolagem {
  /** Leva a rolagem até o ponto da seção em que o progresso vale o pedido, de 0 a 1. */
  irPara(progresso: number): void;
  destruir(): void;
}

export interface OpcoesDaCena {
  readonly secao: HTMLElement;
  /** Chamado a cada quadro com o progresso da rolagem dentro da seção, de 0 a 1. */
  readonly aoProgredir: (progresso: number) => void;
}

export type CriarCena = (opcoes: OpcoesDaCena) => Promise<CenaDeRolagem>;

/**
 * GSAP e Lenis só entram no bundle quando alguma seção pede uma cena, e nunca rodam no servidor.
 * Os testes trocam esta fábrica por uma cena de mentira.
 */
export const CRIAR_CENA = new InjectionToken<CriarCena>('CRIAR_CENA', {
  providedIn: 'root',
  factory: () => (opcoes) => import('./motor-gsap').then((motor) => motor.criarCena(opcoes)),
});
