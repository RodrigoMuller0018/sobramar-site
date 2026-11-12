import { DOCUMENT } from '@angular/common';
import { Injectable, afterNextRender, computed, inject, signal } from '@angular/core';

const SISTEMA_PEDE_MENOS = '(prefers-reduced-motion: reduce)';

/**
 * Decide se a página pode se mexer. Respeita o pedido de menos movimento do sistema e deixa a
 * pessoa ligar o movimento por conta própria, com um botão. No servidor nada se mexe.
 */
@Injectable({ providedIn: 'root' })
export class MovimentoService {
  private readonly janela = inject(DOCUMENT).defaultView;
  private readonly noNavegador = signal(false);
  private readonly sistemaPedeMenos = signal(false);
  private readonly ligadoPelaPessoa = signal(false);

  /** O sistema pede menos movimento. */
  readonly sistemaReduz = this.sistemaPedeMenos.asReadonly();
  /** A pessoa ligou o movimento apesar do pedido do sistema. */
  readonly ligado = this.ligadoPelaPessoa.asReadonly();
  /** Só é verdade no navegador, depois da primeira pintura. */
  readonly permitido = computed(
    () => this.noNavegador() && (!this.sistemaPedeMenos() || this.ligadoPelaPessoa()),
  );

  constructor() {
    afterNextRender(() => {
      const consulta = this.janela?.matchMedia?.(SISTEMA_PEDE_MENOS);
      this.sistemaPedeMenos.set(consulta?.matches ?? false);
      consulta?.addEventListener('change', (evento) => this.sistemaPedeMenos.set(evento.matches));
      this.noNavegador.set(true);
    });
  }

  alternar(): void {
    this.ligadoPelaPessoa.update((ligado) => !ligado);
  }
}
