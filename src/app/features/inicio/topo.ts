import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { LINKS_DO_APP } from '../../core/config/urls';

/** Quantos pixels de rolagem bastam para a barra precisar de fundo. */
const ROLAGEM_QUE_PINTA = 8;
/** Fração da tela que a página rola até o botão da primeira dobra sair de vista. */
const ROLAGEM_QUE_ACENDE = 0.6;

/**
 * A barra fixa: a marca, o caminho para as folhas, o login do app e a ação principal. Sobre a
 * primeira dobra é transparente; com a rolagem ganha fundo e, quando o botão da dobra sai de vista,
 * o da barra passa a ser o principal.
 */
@Component({
  selector: 'header[app-topo]',
  templateUrl: './topo.html',
  styleUrl: './topo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'nav',
    '[class.nav--pintada]': 'pintada()',
    '[class.nav--com-acao]': 'comAcao()',
  },
})
export class Topo {
  private readonly janela = inject(DOCUMENT).defaultView;
  private readonly destruicao = inject(DestroyRef);
  protected readonly links = inject(LINKS_DO_APP);
  /** A página já rolou: o conteúdo passa por baixo da barra. */
  protected readonly pintada = signal(false);
  /** O botão âmbar da primeira dobra saiu de vista: a ação principal passa para a barra. */
  protected readonly comAcao = signal(false);

  constructor() {
    afterNextRender(() => this.acompanharRolagem());
  }

  private acompanharRolagem(): void {
    const janela = this.janela;
    if (!janela) {
      return;
    }
    const medir = () => {
      this.pintada.set(janela.scrollY > ROLAGEM_QUE_PINTA);
      this.comAcao.set(janela.scrollY > janela.innerHeight * ROLAGEM_QUE_ACENDE);
    };
    medir();
    janela.addEventListener('scroll', medir, { passive: true });
    this.destruicao.onDestroy(() => janela.removeEventListener('scroll', medir));
  }
}
