import { Directive, ElementRef, effect, inject, input, untracked } from '@angular/core';
import { MovimentoService } from './movimento.service';

/** 180 ms com 7 px de percurso, na curva de saída do guia. */
const DURACAO = 180;
const PERCURSO = 7;
/** Entre uma linha e a seguinte, para a troca correr como uma onda. */
const ENTRE_LINHAS = 18;
const SAIDA = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Faz o número que acabou de mudar entrar no lugar: se o valor diminuiu, o novo desce de cima; se
 * aumentou, sobe de baixo. O texto é do template; a diretiva só anima. Na primeira pintura, sem
 * movimento ou sem Web Animations, nada se mexe.
 */
@Directive({ selector: '[appTrocaAnimada]' })
export class TrocaAnimada {
  /** O valor que decide a direção da troca. */
  readonly appTrocaAnimada = input.required<number>();
  /** A posição na lista, para o atraso da onda. */
  readonly ordem = input(0);

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly movimento = inject(MovimentoService);
  private anterior: number | null = null;

  constructor() {
    effect(() => {
      const atual = this.appTrocaAnimada();
      untracked(() => this.trocar(atual));
    });
  }

  private trocar(atual: number): void {
    const anterior = this.anterior;
    this.anterior = atual;
    if (
      anterior === null ||
      anterior === atual ||
      !this.movimento.permitido() ||
      typeof this.elemento.animate !== 'function'
    ) {
      return;
    }
    const deOnde = atual < anterior ? -PERCURSO : PERCURSO;
    this.elemento.animate(
      [
        { opacity: 0.25, transform: `translateY(${deOnde}px)` },
        { opacity: 1, transform: 'none' },
      ],
      { duration: DURACAO, delay: this.ordem() * ENTRE_LINHAS, easing: SAIDA, fill: 'backwards' },
    );
  }
}
