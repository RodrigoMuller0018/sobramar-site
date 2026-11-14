import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MovimentoService } from '../../core/movimento/movimento.service';
import { MESES_DO_EXEMPLO } from './dominio/exemplo';
import { Folha, PassoDaLuz } from './folha';

const FALAS: Record<PassoDaLuz, string> = {
  estimado: 'Luz: R$ 180,00 a lápis. A linha diz o motivo: a conta ainda não chegou.',
  chegou:
    'A conta chegou. O valor passa a tinta, e a sobra continua a lápis por causa da fatura do cartão.',
  pago: 'Baixa dada. O carimbo é uma marca sua: o app não paga nada.',
};
/** Inclinação máxima da folha na direção do ponteiro, em graus: para os lados e para cima. */
const INCLINACAO = { lados: 7, altura: 5 };
/** O papel cede quando o carimbo bate e volta. */
const CEDER = { escala: 0.985, atraso: 60, descida: 70, volta: 350 };
const SAIDA = 'cubic-bezier(0.16, 1, 0.3, 1)';
const COM_PONTEIRO = '(hover: hover) and (pointer: fine)';

/**
 * Seção 4: a folha de maio com três passos que a pessoa aciona. A conta de luz chega e o valor
 * passa do lápis para a tinta; a baixa ganha o carimbo "Pago". Nada acontece sozinho, e a folha é
 * montada uma vez: cada passo só troca o estado, e o CSS da folha faz a passagem.
 */
@Component({
  selector: 'section[app-lapis]',
  imports: [Folha],
  templateUrl: './lapis.html',
  styleUrl: './lapis.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { id: 'lapis', class: 'section', 'aria-labelledby': 'titulo-lapis' },
})
export class Lapis {
  private readonly movimento = inject(MovimentoService);
  private readonly janela = inject(DOCUMENT).defaultView;
  private readonly injetor = inject(Injector);
  private readonly papel = viewChild.required('papel', { read: ElementRef<HTMLElement> });
  private readonly baixa = viewChild.required<ElementRef<HTMLButtonElement>>('baixa');
  private readonly voltar = viewChild.required<ElementRef<HTMLButtonElement>>('voltar');
  private readonly chegou = viewChild.required<ElementRef<HTMLButtonElement>>('chegou');

  protected readonly maio = MESES_DO_EXEMPLO[MESES_DO_EXEMPLO.length - 1];
  protected readonly passo = signal<PassoDaLuz>('estimado');
  protected readonly fala = computed(() => FALAS[this.passo()]);

  protected contaChegou(): void {
    this.irPara('chegou', this.baixa);
  }

  protected darBaixa(): void {
    this.irPara('pago', this.voltar);
    if (this.movimento.permitido()) {
      this.ceder();
    }
  }

  protected voltarAoComeco(): void {
    this.irPara('estimado', this.chegou);
  }

  /** A folha inclina alguns graus na direção do ponteiro; no toque, nunca. */
  protected inclinar(evento: PointerEvent): void {
    if (!this.movimento.permitido() || !this.janela?.matchMedia?.(COM_PONTEIRO).matches) {
      return;
    }
    const mesa = evento.currentTarget as HTMLElement;
    const caixa = mesa.getBoundingClientRect();
    const x = (evento.clientX - caixa.left) / caixa.width - 0.5;
    const y = (evento.clientY - caixa.top) / caixa.height - 0.5;
    this.papel().nativeElement.style.transform = `rotateX(${arredondar(-y * INCLINACAO.altura)}deg) rotateY(${arredondar(x * INCLINACAO.lados)}deg)`;
  }

  protected endireitar(): void {
    this.papel().nativeElement.style.removeProperty('transform');
  }

  /** O botão usado fica desativado; o foco vai para o próximo passo, e não se perde. */
  private irPara(passo: PassoDaLuz, proximo: () => ElementRef<HTMLButtonElement>): void {
    this.passo.set(passo);
    afterNextRender(() => proximo().nativeElement.focus(), { injector: this.injetor });
  }

  private ceder(): void {
    const papel = this.papel().nativeElement;
    if (typeof papel.animate !== 'function') {
      return;
    }
    const total = CEDER.atraso + CEDER.descida + CEDER.volta;
    papel.animate(
      [
        { transform: 'scale(1)', offset: 0 },
        { transform: 'scale(1)', offset: CEDER.atraso / total },
        {
          transform: `scale(${CEDER.escala})`,
          offset: (CEDER.atraso + CEDER.descida) / total,
          easing: SAIDA,
        },
        { transform: 'scale(1)', offset: 1 },
      ],
      { duration: total, composite: 'add' },
    );
  }
}

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100 || 0;
}
