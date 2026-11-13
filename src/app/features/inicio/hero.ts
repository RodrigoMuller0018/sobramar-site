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
} from '@angular/core';
import { LINKS_DO_APP } from '../../core/config/urls';
import { MovimentoService } from '../../core/movimento/movimento.service';
import { ATIVO_DO_HERO } from './ativo-do-hero';
import { MESES_DO_EXEMPLO, MesDoExemplo, emReais, sobraCentavos } from './dominio/exemplo';
import { profundidade } from './dominio/profundidade';

/** O arranjo largo: o filme cobre a tela e o texto fica à esquerda do carnê. O CSS usa o mesmo corte. */
const DOBRA_LARGA = '(min-width: 1240px) and (min-aspect-ratio: 3/2)';
/** Milissegundos que a dobra aguenta sem texto: passou disso, ele entra mesmo sem o filme. */
const LIMITE_SEM_TEXTO = 4000;
const MILISSEGUNDOS = 1000;
/** O mês do exemplo que a primeira dobra cita, e que a folha do carnê em 3D mostra. */
const MES_DO_FATO = '2027-05';

/**
 * A primeira dobra: o que é, para quem, um fato do exemplo e o carnê em 3D. Na tela larga o filme
 * da abertura toca uma vez e o texto entra quando a folha do mês assenta; nas outras, e sempre que a
 * página não pode se mexer, o quadro final e o texto já aparecem prontos. O filme e os quadros vêm
 * de `ATIVO_DO_HERO`, para o hero definitivo entrar sem mexer aqui.
 */
@Component({
  selector: 'section[app-hero]',
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss', './hero-movimento.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hero', 'aria-labelledby': 'titulo-hero' },
})
export class Hero {
  private readonly dobra = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly janela = inject(DOCUMENT).defaultView;
  private readonly destruicao = inject(DestroyRef);
  private readonly filme = viewChild.required<ElementRef<HTMLVideoElement>>('filme');
  private readonly cena = viewChild.required<ElementRef<HTMLElement>>('cena');
  private readonly texto = viewChild.required<ElementRef<HTMLElement>>('texto');
  private readonly imagem = viewChild.required<ElementRef<HTMLImageElement>>('imagem');

  protected readonly links = inject(LINKS_DO_APP);
  protected readonly ativo = inject(ATIVO_DO_HERO);
  protected readonly movimento = inject(MovimentoService);
  protected readonly fato = fatoDoExemplo();

  /** O script assumiu a entrada do texto; antes disso vale a espera escrita no CSS. */
  protected readonly armada = signal(false);
  /** O texto já pode aparecer. */
  protected readonly revelada = signal(false);
  /** O quadro final cobre o filme: sem movimento, fora da tela larga ou se o filme falhar. */
  protected readonly parada = signal(false);
  /** A imagem parada já chegou (ou falhou): fora da tela larga, é quando ela pode assentar. */
  protected readonly imagemPronta = signal(false);
  /** O botão de alternância diz por escrito como o movimento está; o que se lê é o que se ouve. */
  protected readonly rotuloDoMovimento = computed(() =>
    this.movimento.permitido() ? 'Movimento ligado' : 'Movimento desligado',
  );
  /** Fora da tela larga, o botão de movimento só aparece para quem precisa dele. */
  protected readonly pedeControle = computed(
    () => !this.movimento.permitido() || this.movimento.sistemaReduz(),
  );

  private readonly larga = signal(false);
  private readonly pronta = signal(false);
  protected readonly comFilme = computed(
    () => this.pronta() && this.movimento.permitido() && this.larga(),
  );
  /** A abertura toca sozinha uma vez por visita; depois disso, só a pedido. */
  private abriuSozinha = false;
  private podiaSeMexer = false;
  private relogio: number | undefined;
  private quadro: number | undefined;
  /** Conta as aberturas: o que sobra de uma antiga (vigia, recusa de tocar) não mexe na nova. */
  private abertura = 0;

  constructor() {
    afterNextRender(() => {
      this.observarLargura();
      this.ouvirPonteiro();
      this.esperarImagem();
      this.pronta.set(true);
    });
    effect(() => {
      if (this.pronta()) {
        const comFilme = this.comFilme();
        const podeSeMexer = this.movimento.permitido();
        untracked(() => this.decidir(comFilme, podeSeMexer));
      }
    });
    this.destruicao.onDestroy(() => {
      this.abertura++;
      this.cancelarRelogio();
      this.cancelarQuadro();
    });
  }

  /**
   * A abertura toca sozinha na primeira vez que há filme, e de novo quando a pessoa liga o
   * movimento. Voltar à tela larga depois de um redimensionamento não a repete: fica o quadro final.
   */
  private decidir(comFilme: boolean, podeSeMexer: boolean): void {
    const ligouAgora = podeSeMexer && !this.podiaSeMexer;
    this.podiaSeMexer = podeSeMexer;
    if (!comFilme) {
      this.assentar();
    } else if (ligouAgora || !this.abriuSozinha) {
      this.abriuSozinha = true;
      this.abrir();
    }
  }

  /** Toca a abertura do começo. O texto espera a folha do mês assentar. */
  protected abrir(): void {
    const janela = this.janela;
    if (!janela || !this.comFilme()) {
      return;
    }
    const filme = this.filme().nativeElement;
    const vez = ++this.abertura;
    this.cancelarRelogio();
    // A espera do texto conta desde que a página abriu, não desde que o script chegou. Se ele
    // chegou depois do limite, o texto já entrou sozinho pelo CSS e fica onde está.
    const jaEsperou = this.armada() ? 0 : janela.performance.now();
    const textoJaEntrou = jaEsperou > LIMITE_SEM_TEXTO;
    this.armada.set(true);
    this.parada.set(false);
    this.revelada.set(textoJaEntrou);
    if (!filme.getAttribute('src')) {
      filme.src = this.ativo.filme;
    }
    filme.muted = true;
    filme.currentTime = 0;
    filme.play().catch(() => {
      if (vez === this.abertura) {
        this.assentar();
      }
    });
    this.vigiarOFilme(filme, vez);
    this.relogio = janela.setTimeout(
      () => this.revelar(),
      Math.max(0, LIMITE_SEM_TEXTO - jaEsperou),
    );
  }

  /**
   * Onde o navegador deixa, a entrada do texto segue o relógio do próprio filme, quadro a quadro:
   * se o filme engasgar ao carregar, o texto espera por ele em vez de se adiantar.
   */
  private vigiarOFilme(filme: HTMLVideoElement, vez: number): void {
    if (!temVigiaDeQuadros(filme)) {
      return;
    }
    const conferir: VideoFrameRequestCallback = (_agora, quadro) => {
      if (vez !== this.abertura || this.revelada()) {
        return;
      }
      if (quadro.mediaTime >= this.ativo.textoEntraEm) {
        this.revelar();
      } else {
        filme.requestVideoFrameCallback(conferir);
      }
    };
    filme.requestVideoFrameCallback(conferir);
  }

  /** O filme começou a andar: sem a vigia quadro a quadro, quem solta o texto é este relógio. */
  protected aoTocar(): void {
    const janela = this.janela;
    const filme = this.filme().nativeElement;
    if (!janela || this.parada() || temVigiaDeQuadros(filme)) {
      return;
    }
    const falta = this.ativo.textoEntraEm - filme.currentTime;
    this.cancelarRelogio();
    this.relogio = janela.setTimeout(() => this.revelar(), Math.max(0, falta) * MILISSEGUNDOS);
  }

  protected revelar(): void {
    this.cancelarRelogio();
    this.revelada.set(true);
  }

  /** Sem filme: o quadro final e o texto aparecem prontos, e a cena volta ao lugar. */
  protected assentar(): void {
    this.abertura++;
    this.cancelarRelogio();
    const filme = this.filme().nativeElement;
    if (!filme.paused) {
      filme.pause();
    }
    this.armada.set(true);
    this.parada.set(true);
    this.revelada.set(true);
    this.soltar();
  }

  // No servidor nada disto chega a ser agendado, e a janela de lá nem tem estes métodos.
  private cancelarRelogio(): void {
    if (this.relogio !== undefined) {
      this.janela?.clearTimeout(this.relogio);
      this.relogio = undefined;
    }
  }

  private cancelarQuadro(): void {
    if (this.quadro !== undefined) {
      this.janela?.cancelAnimationFrame(this.quadro);
      this.quadro = undefined;
    }
  }

  private observarLargura(): void {
    const consulta = this.janela?.matchMedia?.(DOBRA_LARGA);
    if (!consulta) {
      return;
    }
    const atualizar = () => this.larga.set(consulta.matches);
    atualizar();
    consulta.addEventListener('change', atualizar);
    this.destruicao.onDestroy(() => consulta.removeEventListener('change', atualizar));
  }

  /** Fora da tela larga a imagem parada só assenta depois de chegar, para o movimento ser visto. */
  private esperarImagem(): void {
    const imagem = this.imagem().nativeElement;
    const chegou = () => this.imagemPronta.set(true);
    if (imagem.complete) {
      chegou();
      return;
    }
    imagem.addEventListener('load', chegou, { once: true });
    imagem.addEventListener('error', chegou, { once: true });
    this.destruicao.onDestroy(() => {
      imagem.removeEventListener('load', chegou);
      imagem.removeEventListener('error', chegou);
    });
  }

  /** Profundidade: a cena e o texto acompanham o ponteiro, alguns pixels, em sentidos opostos. */
  private ouvirPonteiro(): void {
    const dobra = this.dobra.nativeElement;
    const mover = (evento: PointerEvent) => this.acompanhar(evento);
    const soltar = () => this.soltar();
    dobra.addEventListener('pointermove', mover, { passive: true });
    dobra.addEventListener('pointerleave', soltar);
    this.destruicao.onDestroy(() => {
      dobra.removeEventListener('pointermove', mover);
      dobra.removeEventListener('pointerleave', soltar);
    });
  }

  /** Só `transform`, direto nos elementos e uma vez por quadro: nada de detecção de mudança. */
  private acompanhar(evento: PointerEvent): void {
    const janela = this.janela;
    if (!janela || !this.comFilme() || evento.pointerType === 'touch') {
      return;
    }
    this.cancelarQuadro();
    this.quadro = janela.requestAnimationFrame(() => {
      const caixa = this.dobra.nativeElement.getBoundingClientRect();
      const planos = profundidade(
        (evento.clientX - caixa.left) / caixa.width,
        (evento.clientY - caixa.top) / caixa.height,
      );
      this.cena().nativeElement.style.transform = planos.cena;
      this.texto().nativeElement.style.transform = planos.texto;
    });
  }

  /** A cena e o texto voltam ao lugar. */
  private soltar(): void {
    this.cancelarQuadro();
    this.cena().nativeElement.style.removeProperty('transform');
    this.texto().nativeElement.style.removeProperty('transform');
  }
}

/** Nem todo navegador avisa a cada quadro do filme; os que não avisam ficam com o relógio da página. */
function temVigiaDeQuadros(filme: HTMLVideoElement): boolean {
  return 'requestVideoFrameCallback' in filme;
}

/** O fato da primeira dobra sai do exemplo, nunca de um número escrito à mão. */
function fatoDoExemplo(): { readonly mes: string; readonly sobra: string } {
  const mes: MesDoExemplo | undefined = MESES_DO_EXEMPLO.find(
    (candidato) => candidato.competencia === MES_DO_FATO,
  );
  if (!mes) {
    throw new Error(`O exemplo não tem o mês ${MES_DO_FATO}.`);
  }
  return { mes: mes.nome.toLowerCase(), sobra: emReais(sobraCentavos(mes)) };
}
