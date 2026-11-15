import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { MovimentoService } from '../../core/movimento/movimento.service';
import { emReais } from './dominio/exemplo';
import { ENTRADAS, HOJE, Regra, SAIDAS, faixasDaRegra, projetar } from './dominio/projecao';
import {
  ASSENTAR,
  ENTRAR_O_NUMERO,
  ESTENDER,
  INICIO_DO_ASSENTO,
  RISCO,
  SAIR_O_NUMERO,
  roteiroDaRegua,
} from './dominio/roteiro-da-regua';

/** A curva de saída do guia, a mesma do token `--saida`. */
const SAIDA = 'cubic-bezier(0.16, 1, 0.3, 1)';
/** `power2.out`: a faixa da geladeira desacelera até outubro. */
const DESACELERA = 'cubic-bezier(0.33, 1, 0.68, 1)';
const ABERTA = 'inset(0% 0% 0% 0% round 8px)';
const FECHADA = 'inset(0% 100% 0% 0% round 8px)';
/** A régua começa quando o topo dela passa de 72 % da altura da tela. */
const GATILHO = '0px 0px -28% 0px';
/** Antes de a geladeira começar, a régua estreita já desliza até maio. */
const ANTES_DA_GELADEIRA = 350;
const FOLGA = 20;
const CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const GELADEIRA = SAIDAS.find((regra) => regra.nome === 'Geladeira') as Regra;
const APAGADOS: readonly boolean[] = CURTOS.map(() => false);

interface FaixaNaRegua {
  readonly coluna: string;
  readonly texto: string;
  /** Um mês só: a faixa é estreita e o valor precisa de letra menor para caber inteiro. */
  readonly curta: boolean;
}

interface LinhaDaRegua {
  readonly nome: string;
  readonly faixas: readonly FaixaNaRegua[];
}

function paraLinha(regra: Regra): LinhaDaRegua {
  return {
    nome: regra.nome,
    faixas: faixasDaRegra(regra).map((faixa) => {
      const meses = faixa.ate - faixa.de + 1;
      const quantas = regra.parcelas ? `, ${meses} de ${regra.parcelas} parcelas` : ' por mês';
      return {
        coluna: `${faixa.de + 1} / ${faixa.ate + 2}`,
        texto: emReais(faixa.centavos) + (meses > 1 ? quantas : ''),
        curta: meses === 1,
      };
    }),
  };
}

/**
 * Seção 3: a régua do ano. Cada compromisso é uma faixa do comprimento dos meses que ocupa, e a
 * sobra de cada mês fica embaixo. Sem movimento (e no servidor) a régua já aparece pronta, com a
 * geladeira; com movimento, as faixas são riscadas quando a régua entra na tela e a geladeira se
 * estende de maio a outubro, trocando a sobra de cada mês que ela alcança.
 */
@Component({
  selector: 'section[app-regua]',
  templateUrl: './regua.html',
  styleUrl: './regua.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { id: 'sozinho', class: 'section', 'aria-labelledby': 'titulo-regua' },
})
export class Regua {
  protected readonly movimento = inject(MovimentoService);
  private readonly janela = inject(DOCUMENT).defaultView;
  private readonly rolavel = viewChild.required('rolavel', { read: ElementRef<HTMLElement> });
  private readonly nova = viewChild.required('nova', { read: ElementRef<HTMLElement> });
  private readonly comuns = viewChildren('comum', { read: ElementRef<HTMLElement> });
  private readonly cabecas = viewChildren('cabeca', { read: ElementRef<HTMLElement> });
  private readonly numeros = viewChildren('numero', { read: ElementRef<HTMLElement> });
  private readonly nomes = viewChildren('nome', { read: ElementRef<HTMLElement> });

  protected readonly meses = CURTOS.map((curto, indice) => ({ curto, hoje: indice + 1 === HOJE }));
  protected readonly entradas = ENTRADAS.map(paraLinha);
  protected readonly saidas = SAIDAS.filter((regra) => regra !== GELADEIRA).map(paraLinha);
  protected readonly geladeira = paraLinha(GELADEIRA);

  private readonly com = projetar();
  private readonly sem = projetar({ sem: GELADEIRA.nome });
  private readonly sobras = signal<readonly number[]>(this.com);
  protected readonly celulas = computed(() =>
    this.sobras().map((centavos, indice) => ({
      texto: emReais(centavos),
      mudou: centavos === this.com[indice] && this.com[indice] !== this.sem[indice],
    })),
  );
  protected readonly acesos = signal(APAGADOS);

  private animacoes: Animation[] = [];
  private relogios: ReturnType<typeof setTimeout>[] = [];
  private observador: IntersectionObserver | null = null;
  private vista = false;

  constructor() {
    effect(() => {
      const pode = this.movimento.permitido();
      untracked(() => (pode ? this.preparar() : this.terminar()));
    });
    inject(DestroyRef).onDestroy(() => this.terminar());
  }

  /** O botão repete só a parte da geladeira. */
  protected repetir(): void {
    this.tocar(false);
  }

  private get podeAnimar(): boolean {
    const janela = this.janela;
    return (
      !!janela &&
      'IntersectionObserver' in janela &&
      typeof this.nova().nativeElement.animate === 'function'
    );
  }

  /** Antes de a régua aparecer: tudo recolhido, e a sobra ainda sem a geladeira. */
  private preparar(): void {
    if (this.vista || !this.podeAnimar) {
      return;
    }
    this.limpar();
    this.sobras.set(this.sem);
    for (const faixa of [...this.comuns(), this.nova()]) {
      const guarda = faixa.nativeElement.animate([{ clipPath: FECHADA }, { clipPath: ABERTA }], {
        duration: RISCO,
        delay: 1,
        fill: 'backwards',
      });
      guarda.pause();
      this.animacoes.push(guarda);
    }
    const janela = this.janela as Window & typeof globalThis;
    this.observador = new janela.IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
          this.vista = true;
          this.observador?.disconnect();
          this.tocar(true);
        }
      },
      { rootMargin: GATILHO },
    );
    this.observador.observe(this.rolavel().nativeElement);
  }

  private tocar(inteira: boolean): void {
    this.limpar();
    if (!this.movimento.permitido() || !this.podeAnimar) {
      return;
    }
    const comuns = inteira ? this.comuns() : [];
    const primeira = GELADEIRA.de - 1;
    const roteiro = roteiroDaRegua(comuns.length, primeira, GELADEIRA.ate - GELADEIRA.de + 1);
    const nova = this.nova().nativeElement;
    this.sobras.set(this.sem);

    comuns.forEach((faixa, indice) =>
      this.animar(faixa.nativeElement, [{ clipPath: FECHADA }, { clipPath: ABERTA }], {
        duration: RISCO,
        delay: roteiro.faixas[indice],
        easing: SAIDA,
      }),
    );
    // A geladeira chega 10 px levantada, se estende até outubro e assenta na linha.
    this.animar(nova, [{ clipPath: FECHADA }, { clipPath: ABERTA }], {
      duration: ESTENDER,
      delay: roteiro.geladeira,
      easing: DESACELERA,
    });
    this.animar(nova, [{ transform: 'translateY(-10px)' }, { transform: 'none' }], {
      duration: ASSENTAR,
      delay: roteiro.geladeira + INICIO_DO_ASSENTO,
      easing: SAIDA,
    });
    this.acompanhar(roteiro.geladeira, primeira, primeira + GELADEIRA.ate - GELADEIRA.de);
    for (const troca of roteiro.trocas) {
      this.depois(troca.em, () => this.trocar(troca.mes));
    }
    this.depois(roteiro.fim, () => this.acesos.set(APAGADOS));
  }

  /** O número velho sobe e some; o novo entra de baixo e fica azul-céu. */
  private trocar(mes: number): void {
    this.acesos.update((acesos) => acesos.map((aceso, indice) => aceso || indice === mes));
    const numero = this.numeros()[mes]?.nativeElement;
    if (!numero) {
      return;
    }
    const saida = this.animar(
      numero,
      [
        { transform: 'none', opacity: 1 },
        { transform: 'translateY(-70%)', opacity: 0 },
      ],
      { duration: SAIR_O_NUMERO, easing: 'linear', fill: 'forwards' },
    );
    this.depois(SAIR_O_NUMERO, () => {
      saida.cancel();
      this.sobras.update((sobras) =>
        sobras.map((centavos, indice) => (indice === mes ? this.com[indice] : centavos)),
      );
      this.animar(
        numero,
        [
          { transform: 'translateY(70%)', opacity: 0 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: ENTRAR_O_NUMERO, easing: SAIDA },
      );
    });
  }

  /** Na tela estreita a régua rola de lado sozinha: vai até maio e acompanha a ponta da faixa. */
  private acompanhar(inicio: number, primeira: number, ultima: number): void {
    const rolavel = this.rolavel().nativeElement;
    if (rolavel.scrollWidth <= rolavel.clientWidth + 4) {
      return;
    }
    const cabecas = this.cabecas();
    const largura = this.nomes()[0]?.nativeElement.offsetWidth ?? 0;
    const de = cabecas[primeira].nativeElement;
    const ate = cabecas[ultima].nativeElement;
    this.depois(Math.max(0, inicio - ANTES_DA_GELADEIRA), () =>
      rolavel.scrollTo({ left: de.offsetLeft - largura - 6, behavior: 'smooth' }),
    );
    this.depois(inicio, () =>
      rolavel.scrollTo({
        left: ate.offsetLeft + ate.offsetWidth - rolavel.clientWidth + FOLGA,
        behavior: 'smooth',
      }),
    );
  }

  private animar(
    elemento: HTMLElement,
    quadros: Keyframe[],
    opcoes: KeyframeAnimationOptions,
  ): Animation {
    const animacao = elemento.animate(quadros, { fill: 'backwards', ...opcoes });
    this.animacoes.push(animacao);
    return animacao;
  }

  private depois(milissegundos: number, acao: () => void): void {
    this.relogios.push(setTimeout(acao, milissegundos));
  }

  private limpar(): void {
    this.animacoes.forEach((animacao) => animacao.cancel());
    this.animacoes = [];
    this.relogios.forEach((relogio) => clearTimeout(relogio));
    this.relogios = [];
  }

  /** Sem movimento, ou ao sair: a régua pronta, com a geladeira e a sobra final. */
  private terminar(): void {
    this.limpar();
    this.observador?.disconnect();
    this.observador = null;
    this.sobras.set(this.com);
    this.acesos.set(APAGADOS);
  }
}
