import { DOCUMENT } from '@angular/common';
import { Injectable, afterNextRender, computed, effect, inject, signal } from '@angular/core';

const SISTEMA_PEDE_MENOS = '(prefers-reduced-motion: reduce)';
/** A mesma chave que `public/movimento.js` lê antes da primeira pintura. */
export const CHAVE_DO_MOVIMENTO = 'sobramar:movimento';

type Escolha = 'ligado' | 'desligado';

/**
 * Decide se a página pode se mexer. Sem escolha da pessoa, vale o pedido de menos movimento do
 * sistema; o botão de movimento vira a decisão para qualquer lado, e a escolha fica guardada no
 * navegador. O CSS acompanha por `html[data-movimento]`. No servidor nada se mexe.
 */
@Injectable({ providedIn: 'root' })
export class MovimentoService {
  private readonly documento = inject(DOCUMENT);
  private readonly janela = this.documento.defaultView;
  private readonly noNavegador = signal(false);
  private readonly sistemaPedeMenos = signal(false);
  private readonly escolha = signal<Escolha | null>(null);

  /** O sistema pede menos movimento. */
  readonly sistemaReduz = this.sistemaPedeMenos.asReadonly();
  /** Só é verdade no navegador, depois da primeira pintura: antes disso ninguém sabe a resposta. */
  readonly decidido = this.noNavegador.asReadonly();
  /** A página pode se mexer. */
  readonly permitido = computed(() => {
    const escolha = this.escolha();
    return this.noNavegador() && (escolha ? escolha === 'ligado' : !this.sistemaPedeMenos());
  });

  constructor() {
    afterNextRender(() => {
      const consulta = this.janela?.matchMedia?.(SISTEMA_PEDE_MENOS);
      this.sistemaPedeMenos.set(consulta?.matches ?? false);
      consulta?.addEventListener('change', (evento) => this.sistemaPedeMenos.set(evento.matches));
      this.escolha.set(this.escolhaGuardada());
      this.noNavegador.set(true);
    });
    effect(() => {
      if (this.noNavegador()) {
        this.documento.documentElement.dataset['movimento'] = this.permitido()
          ? 'ligado'
          : 'desligado';
      }
    });
  }

  /** Liga se estava parado, desliga se estava se mexendo, e lembra a escolha. */
  alternar(): void {
    const escolha: Escolha = this.permitido() ? 'desligado' : 'ligado';
    this.escolha.set(escolha);
    try {
      this.janela?.localStorage.setItem(CHAVE_DO_MOVIMENTO, escolha);
    } catch {
      // Sem armazenamento (modo restrito do navegador): a escolha vale só até fechar a página.
    }
  }

  private escolhaGuardada(): Escolha | null {
    try {
      const guardada = this.janela?.localStorage.getItem(CHAVE_DO_MOVIMENTO);
      return guardada === 'ligado' || guardada === 'desligado' ? guardada : null;
    } catch {
      return null;
    }
  }
}
