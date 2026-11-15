import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { CRIAR_CENA, CenaDeRolagem } from '../../core/movimento/cena-de-rolagem';
import { MovimentoService } from '../../core/movimento/movimento.service';
import { MESES_DO_EXEMPLO } from './dominio/exemplo';
import { chegadaDaPilha, estadoDasFolhas, folhaAtiva, progressoDaFolha } from './dominio/virada';
import { Folha } from './folha';

/** A cena só cabe com texto e folha lado a lado e a folha inteira na tela. O CSS usa o mesmo corte. */
const CABE_A_CENA = '(min-width: 900px) and (min-height: 660px)';

/**
 * As folhas do exemplo. Três modos, e o CSS escolhe o layout sem salto: sem JavaScript, as folhas
 * ficam em sequência; com menos movimento ou em tela pequena, os botões de mês trocam a folha; com
 * movimento e espaço, a rolagem vira a folha e os botões levam a rolagem até o mês.
 */
@Component({
  selector: 'section[app-folhas]',
  imports: [Folha],
  templateUrl: './folhas.html',
  styleUrl: './folhas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    id: 'folhas',
    class: 'section',
    'aria-labelledby': 'titulo-folhas',
    '[class.folhas--ligada]': 'movimento.permitido()',
    '[class.folhas--estatica]': 'falhou()',
    '[class.folhas--interativa]': 'interativa()',
  },
})
export class Folhas {
  private readonly criarCena = inject(CRIAR_CENA);
  private readonly secao = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly janela = inject(DOCUMENT).defaultView;
  private readonly destruicao = inject(DestroyRef);
  private readonly papeis = viewChildren('papel', { read: ElementRef<HTMLElement> });
  private readonly pilha = viewChild.required('pilha', { read: ElementRef<HTMLElement> });
  protected readonly movimento = inject(MovimentoService);

  protected readonly folhas = MESES_DO_EXEMPLO.map((mes) => ({
    mes,
    id: `folha-${mes.competencia}`,
  }));
  protected readonly ativa = signal(0);
  protected readonly nota = computed(() => this.folhas[this.ativa()].mes.nota);
  protected readonly falhou = signal(false);
  /** Verdade depois da primeira pintura no navegador: os botões já respondem. */
  protected readonly interativa = signal(false);
  /** Na cena a frase muda a cada virada; anunciar cada uma atrapalharia quem usa leitor de tela. */
  protected readonly naCena = signal(false);

  private readonly cabe = signal(false);
  private readonly emCena = computed(
    () => this.movimento.permitido() && this.cabe() && !this.falhou(),
  );
  private cena: CenaDeRolagem | null = null;
  private pedida = false;
  private destruida = false;

  constructor() {
    afterNextRender(() => {
      this.interativa.set(true);
      this.observarTamanho();
    });
    effect(() => {
      const emCena = this.emCena();
      untracked(() => (emCena ? this.entrarEmCena() : this.sairDeCena()));
    });
    this.destruicao.onDestroy(() => {
      this.destruida = true;
      this.sairDeCena();
    });
  }

  /** O botão é o caminho principal: na cena leva a rolagem até o mês; fora dela, troca a folha. */
  protected mostrar(indice: number): void {
    const progresso = progressoDaFolha(indice, this.folhas.length);
    if (this.cena) {
      this.cena.irPara(progresso);
    } else if (this.emCena()) {
      this.rolarAte(progresso);
    } else {
      this.ativa.set(indice);
    }
  }

  /** Enquanto o motor da cena carrega, o botão rola a página por conta própria. */
  private rolarAte(progresso: number): void {
    const secao = this.secao.nativeElement;
    const janela = this.janela;
    if (janela) {
      const inicio = secao.getBoundingClientRect().top + janela.scrollY;
      janela.scrollTo({ top: inicio + (secao.offsetHeight - janela.innerHeight) * progresso });
    }
  }

  private observarTamanho(): void {
    const consulta = this.janela?.matchMedia?.(CABE_A_CENA);
    if (!consulta) {
      return;
    }
    const atualizar = () => this.cabe.set(consulta.matches);
    atualizar();
    consulta.addEventListener('change', atualizar);
    this.destruicao.onDestroy(() => consulta.removeEventListener('change', atualizar));
  }

  private entrarEmCena(): void {
    if (this.cena || this.pedida) {
      return;
    }
    this.pedida = true;
    this.criarCena({
      secao: this.secao.nativeElement,
      aoProgredir: (progresso) => this.aplicar(progresso),
      aoChegar: (progresso) => {
        this.pilha().nativeElement.style.transform = chegadaDaPilha(progresso);
      },
    })
      .then((cena) => {
        this.pedida = false;
        if (this.emCena() && !this.destruida) {
          this.cena = cena;
          this.naCena.set(true);
        } else {
          cena.destruir();
        }
      })
      .catch(() => {
        this.pedida = false;
        this.falhou.set(true);
      });
  }

  private sairDeCena(): void {
    this.cena?.destruir();
    this.cena = null;
    this.naCena.set(false);
    this.pilha().nativeElement.style.removeProperty('transform');
    for (const papel of this.papeis()) {
      const estilo = papel.nativeElement.style;
      estilo.removeProperty('transform');
      estilo.removeProperty('filter');
      estilo.removeProperty('opacity');
      estilo.removeProperty('pointer-events');
    }
  }

  /**
   * Só `transform`, `filter` e `opacity`, direto no elemento: nada de detecção de mudança a cada
   * quadro.
   */
  private aplicar(progresso: number): void {
    const total = this.folhas.length;
    const papeis = this.papeis();
    estadoDasFolhas(progresso, total).forEach((estado, indice) => {
      const estilo = papeis[indice]?.nativeElement.style;
      if (estilo) {
        estilo.transform = estado.transform;
        estilo.filter = estado.filtro;
        estilo.opacity = String(estado.opacidade);
        estilo.pointerEvents = estado.opacidade < 1 ? 'none' : '';
      }
    });
    this.ativa.set(folhaAtiva(progresso, total));
  }
}
