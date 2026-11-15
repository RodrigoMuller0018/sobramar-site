import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockInstance } from 'vitest';
import { violacoesDeAcessibilidade } from '../../../testing/acessibilidade';
import {
  DOBRA_LARGA,
  MENOS_MOVIMENTO,
  limparMovimento,
  removerMidia,
  simularMidia,
} from '../../../testing/midia';
import { URL_DO_APP } from '../../core/config/urls';
import { ATIVO_DO_HERO, AtivoDoHero } from './ativo-do-hero';
import { profundidade } from './dominio/profundidade';
import { Hero } from './hero';

describe('Hero', () => {
  const tocar = vi.spyOn(HTMLMediaElement.prototype, 'play');
  const pausar = vi.spyOn(HTMLMediaElement.prototype, 'pause');

  beforeEach(() => {
    tocar.mockReset().mockResolvedValue(undefined);
    pausar.mockReset().mockReturnValue(undefined);
    TestBed.configureTestingModule({
      providers: [{ provide: URL_DO_APP, useValue: 'https://app.exemplo.test' }],
    });
  });

  afterEach(() => {
    removerMidia();
    limparMovimento();
  });

  /** O primeiro giro pinta e acorda o componente; o segundo aplica o que ele decidiu. */
  function estabilizar(): void {
    TestBed.tick();
    TestBed.tick();
  }

  function renderizar(): ComponentFixture<Hero> {
    const fixture = TestBed.createComponent(Hero);
    estabilizar();
    return fixture;
  }

  const palco = (fixture: ComponentFixture<Hero>) =>
    (fixture.nativeElement as HTMLElement).querySelector('.palco') as HTMLElement;
  const filme = (fixture: ComponentFixture<Hero>) =>
    (fixture.nativeElement as HTMLElement).querySelector('video') as HTMLVideoElement;
  const controles = (fixture: ComponentFixture<Hero>) =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.controle'),
    );
  const rotulos = (fixture: ComponentFixture<Hero>) =>
    controles(fixture).map((controle) => controle.textContent?.trim());
  const controle = (fixture: ComponentFixture<Hero>, rotulo: string) =>
    controles(fixture).find((botao) => botao.textContent?.trim() === rotulo) as HTMLButtonElement;

  describe('o que diz', () => {
    it('deve dizer o que é, para quem e trazer um fato do exemplo', () => {
      const hero: HTMLElement = renderizar().nativeElement;

      expect(hero.querySelector('h1')?.textContent?.trim()).toBe(
        'O carnê dos seus próximos 12 meses',
      );
      expect(hero.querySelector('.lead')?.textContent).toContain('recebe salário e parcela');
      expect(hero.querySelector('.lead')?.textContent).toContain('maio de 2027 fecha com sobra de');
      expect(hero.querySelector('.lead strong')?.textContent).toBe('R$ 2.680,10');
      expect(hero.querySelector('.hero__nota')?.textContent).toBe(
        'Sem senha de banco. O app não move dinheiro.',
      );
    });

    it('deve ter só duas ações: montar o carnê no app e ver as folhas', () => {
      const botoes = Array.from(
        (renderizar().nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('.btn'),
      );

      expect(botoes.map((botao) => botao.textContent)).toEqual([
        'Montar meu carnê',
        'Ver as folhas',
      ]);
      expect(botoes.map((botao) => botao.getAttribute('href'))).toEqual([
        'https://app.exemplo.test/comecar',
        '#folhas',
      ]);
    });

    it('deve descrever a imagem, calar o filme e não ter violações de acessibilidade', async () => {
      const fixture = renderizar();
      const hero: HTMLElement = fixture.nativeElement;

      expect(hero.querySelector('img')?.getAttribute('alt')).toContain('Carnê de doze folhas');
      expect(filme(fixture).getAttribute('aria-hidden')).toBe('true');
      expect(await violacoesDeAcessibilidade(hero)).toEqual([]);
    });

    it('deve trocar o quadro final pelo retrato fora da tela larga', () => {
      const hero: HTMLElement = renderizar().nativeElement;
      const retrato = hero.querySelector('source');

      expect(retrato?.getAttribute('srcset')).toBe('hero/carne-retrato.webp');
      expect(retrato?.getAttribute('media')).toBe(
        'not all and (min-width: 1240px) and (min-aspect-ratio: 3/2)',
      );
      expect(hero.querySelector('img')?.getAttribute('src')).toBe('hero/carne-fim.webp');
    });
  });

  describe('a abertura', () => {
    /** Milissegundos desde que a página abriu, como o componente os lê. */
    let agora: MockInstance<() => number>;

    beforeEach(() => {
      vi.useFakeTimers();
      agora = vi.spyOn(performance, 'now').mockReturnValue(0);
    });

    afterEach(() => {
      agora.mockRestore();
      vi.useRealTimers();
      Reflect.deleteProperty(HTMLVideoElement.prototype, 'requestVideoFrameCallback');
    });

    it('deve tocar o filme na tela larga e segurar o texto até a folha do mês assentar', () => {
      simularMidia({ [DOBRA_LARGA]: true });
      const fixture = renderizar();

      expect(tocar).toHaveBeenCalledTimes(1);
      expect(filme(fixture).getAttribute('src')).toBe('hero/carne-abertura.mp4');
      expect(filme(fixture).muted).toBe(true);
      expect(palco(fixture).classList).toContain('palco--armada');
      expect(palco(fixture).classList).not.toContain('palco--revelada');
      expect(palco(fixture).classList).not.toContain('palco--parada');

      filme(fixture).dispatchEvent(new Event('playing'));
      vi.advanceTimersByTime(1349);
      estabilizar();
      expect(palco(fixture).classList).not.toContain('palco--revelada');

      vi.advanceTimersByTime(1);
      estabilizar();
      expect(palco(fixture).classList).toContain('palco--revelada');
    });

    it('deve seguir o relógio do próprio filme, quadro a quadro, onde o navegador deixa', () => {
      const quadros: VideoFrameRequestCallback[] = [];
      const pedirQuadro = vi.fn((conferir: VideoFrameRequestCallback) => quadros.push(conferir));
      Object.defineProperty(HTMLVideoElement.prototype, 'requestVideoFrameCallback', {
        value: pedirQuadro,
        configurable: true,
      });
      const noQuadro = (mediaTime: number) =>
        quadros.at(-1)?.(0, { mediaTime } as VideoFrameCallbackMetadata);
      simularMidia({ [DOBRA_LARGA]: true });
      const fixture = renderizar();

      // Com a vigia, o relógio da página não solta o texto: só o do filme.
      filme(fixture).dispatchEvent(new Event('playing'));
      vi.advanceTimersByTime(2000);
      noQuadro(1.2);
      estabilizar();
      expect(palco(fixture).classList).not.toContain('palco--revelada');
      expect(pedirQuadro).toHaveBeenCalledTimes(2);

      noQuadro(1.35);
      estabilizar();
      expect(palco(fixture).classList).toContain('palco--revelada');

      // A vigia de uma abertura antiga para sozinha quando outra começa.
      controle(fixture, 'Repetir a abertura').click();
      estabilizar();
      quadros[0](0, { mediaTime: 2 } as VideoFrameCallbackMetadata);
      estabilizar();
      expect(palco(fixture).classList).not.toContain('palco--revelada');
    });

    it('deve soltar o texto no limite quando o filme não anda', () => {
      simularMidia({ [DOBRA_LARGA]: true });
      const fixture = renderizar();

      vi.advanceTimersByTime(3999);
      estabilizar();
      expect(palco(fixture).classList).not.toContain('palco--revelada');

      vi.advanceTimersByTime(1);
      estabilizar();
      expect(palco(fixture).classList).toContain('palco--revelada');
    });

    it('deve soltar o texto quando o filme termina', () => {
      simularMidia({ [DOBRA_LARGA]: true });
      const fixture = renderizar();

      filme(fixture).dispatchEvent(new Event('ended'));
      estabilizar();

      expect(palco(fixture).classList).toContain('palco--revelada');
      expect(palco(fixture).classList).not.toContain('palco--parada');
    });

    it('deve mostrar o quadro final e o texto se o filme falhar', () => {
      simularMidia({ [DOBRA_LARGA]: true });
      const fixture = renderizar();

      filme(fixture).dispatchEvent(new Event('error'));
      estabilizar();

      expect(palco(fixture).classList).toContain('palco--parada');
      expect(palco(fixture).classList).toContain('palco--revelada');
    });

    it('deve mostrar o quadro final se o navegador recusar tocar', async () => {
      simularMidia({ [DOBRA_LARGA]: true });
      tocar.mockRejectedValue(new Error('reprodução bloqueada'));
      const fixture = renderizar();

      await vi.advanceTimersByTimeAsync(0);
      estabilizar();

      expect(palco(fixture).classList).toContain('palco--parada');
      expect(palco(fixture).classList).toContain('palco--revelada');
    });

    it('deve ignorar a recusa de tocar que sobrou de uma abertura antiga', async () => {
      simularMidia({ [DOBRA_LARGA]: true });
      let recusar: (erro: Error) => void = () => undefined;
      tocar.mockReturnValueOnce(new Promise<void>((_, rejeitar) => (recusar = rejeitar)));
      const fixture = renderizar();
      vi.advanceTimersByTime(4000);
      estabilizar();

      controle(fixture, 'Repetir a abertura').click();
      estabilizar();
      recusar(new DOMException('a abertura anterior foi interrompida', 'AbortError'));
      await vi.advanceTimersByTimeAsync(0);
      estabilizar();

      expect(tocar).toHaveBeenCalledTimes(2);
      expect(palco(fixture).classList).not.toContain('palco--parada');
    });

    it('deve assentar quando a tela deixa de ser larga no meio do filme', () => {
      const midia = simularMidia({ [DOBRA_LARGA]: true });
      const fixture = renderizar();
      Object.defineProperty(filme(fixture), 'paused', { value: false });

      midia.mudar(DOBRA_LARGA, false);
      estabilizar();

      expect(pausar).toHaveBeenCalledTimes(1);
      expect(palco(fixture).classList).toContain('palco--parada');
      expect(palco(fixture).classList).toContain('palco--revelada');
      expect(controles(fixture)).toHaveLength(1);
    });

    it('deve deixar o texto onde está quando o script chega depois do limite', () => {
      simularMidia({ [DOBRA_LARGA]: true });
      agora.mockReturnValue(5200);
      const fixture = renderizar();

      expect(tocar).toHaveBeenCalledTimes(1);
      expect(palco(fixture).classList).toContain('palco--revelada');
    });

    it('deve ficar parada e pronta com menos movimento, e tocar quando a pessoa liga', () => {
      simularMidia({ [DOBRA_LARGA]: true, [MENOS_MOVIMENTO]: true });
      const fixture = renderizar();

      expect(tocar).not.toHaveBeenCalled();
      expect(palco(fixture).classList).toContain('palco--parada');
      expect(palco(fixture).classList).toContain('palco--revelada');
      expect(rotulos(fixture)).toEqual(['Movimento desligado']);

      controle(fixture, 'Movimento desligado').click();
      estabilizar();

      expect(tocar).toHaveBeenCalledTimes(1);
      expect(palco(fixture).classList).not.toContain('palco--parada');
      expect(palco(fixture).classList).not.toContain('palco--revelada');
      expect(rotulos(fixture)).toEqual(['Movimento ligado']);

      // "Repetir a abertura" só aparece depois que o texto entrou.
      vi.advanceTimersByTime(4000);
      estabilizar();
      expect(rotulos(fixture)).toEqual(['Repetir a abertura', 'Movimento ligado']);
      // O estado vem no rótulo; `aria-pressed` junto faria o leitor anunciar o estado duas vezes.
      expect(controle(fixture, 'Movimento ligado').hasAttribute('aria-pressed')).toBe(false);
      expect(controle(fixture, 'Movimento ligado').classList).toContain('controle--ligado');
    });

    it('deve contar a espera do texto desde que a página abriu, não desde que o script chegou', () => {
      simularMidia({ [DOBRA_LARGA]: true });
      agora.mockReturnValue(1500);
      const fixture = renderizar();

      vi.advanceTimersByTime(2499);
      estabilizar();
      expect(palco(fixture).classList).not.toContain('palco--revelada');

      vi.advanceTimersByTime(1);
      estabilizar();
      expect(palco(fixture).classList).toContain('palco--revelada');
    });

    it('deve tocar a abertura sozinha uma vez só: voltar à tela larga mostra o quadro final', () => {
      const midia = simularMidia({ [DOBRA_LARGA]: true });
      const fixture = renderizar();
      expect(tocar).toHaveBeenCalledTimes(1);

      midia.mudar(DOBRA_LARGA, false);
      estabilizar();
      midia.mudar(DOBRA_LARGA, true);
      estabilizar();

      expect(tocar).toHaveBeenCalledTimes(1);
      expect(palco(fixture).classList).toContain('palco--parada');
      expect(rotulos(fixture)).toEqual(['Repetir a abertura', 'Movimento ligado']);
    });

    it('deve esperar a imagem parada chegar para deixá-la assentar', () => {
      const chegou = vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(false);
      const fixture = renderizar();
      const imagem = (fixture.nativeElement as HTMLElement).querySelector(
        'img',
      ) as HTMLImageElement;
      expect(palco(fixture).classList).not.toContain('palco--imagem-pronta');

      imagem.dispatchEvent(new Event('load'));
      estabilizar();
      expect(palco(fixture).classList).toContain('palco--imagem-pronta');

      chegou.mockReturnValue(true);
      TestBed.resetTestingModule();
      expect(palco(renderizar()).classList).toContain('palco--imagem-pronta');
      chegou.mockRestore();
    });

    it('deve parar o filme e mostrar o quadro final quando a pessoa desliga o movimento', () => {
      simularMidia({ [DOBRA_LARGA]: true });
      const fixture = renderizar();
      Object.defineProperty(filme(fixture), 'paused', { value: false });

      controle(fixture, 'Movimento ligado').click();
      estabilizar();

      expect(pausar).toHaveBeenCalledTimes(1);
      expect(palco(fixture).classList).toContain('palco--parada');
      expect(palco(fixture).classList).toContain('palco--pede-controle');
    });

    it('deve repetir a abertura pelo botão, segurando o texto de novo', () => {
      simularMidia({ [DOBRA_LARGA]: true });
      const fixture = renderizar();
      vi.advanceTimersByTime(4000);
      estabilizar();
      expect(palco(fixture).classList).toContain('palco--revelada');

      controle(fixture, 'Repetir a abertura').click();
      estabilizar();

      expect(tocar).toHaveBeenCalledTimes(2);
      expect(palco(fixture).classList).not.toContain('palco--revelada');
    });

    it('deve mostrar o quadro final sem tocar o filme fora da tela larga', () => {
      const fixture = renderizar();

      expect(tocar).not.toHaveBeenCalled();
      expect(filme(fixture).hasAttribute('src')).toBe(false);
      expect(palco(fixture).classList).toContain('palco--parada');
      expect(palco(fixture).classList).not.toContain('palco--pede-controle');
      expect(rotulos(fixture)).toEqual(['Movimento ligado']);
    });

    it('deve passar a tocar quando a tela fica larga', () => {
      const midia = simularMidia({ [DOBRA_LARGA]: false });
      renderizar();
      expect(tocar).not.toHaveBeenCalled();

      midia.mudar(DOBRA_LARGA, true);
      estabilizar();

      expect(tocar).toHaveBeenCalledTimes(1);
    });

    it('deve aceitar outro ativo sem mudar o componente', () => {
      const definitivo: AtivoDoHero = {
        filme: 'hero/definitivo.mp4',
        quadroInicial: 'hero/definitivo-inicio.webp',
        quadroFinal: { url: 'hero/definitivo-fim.webp', largura: 1920, altura: 1080 },
        retrato: { url: 'hero/definitivo-retrato.webp', largura: 1080, altura: 1350 },
        textoEntraEm: 3,
        descricao: 'O carnê definitivo',
      };
      TestBed.overrideProvider(ATIVO_DO_HERO, { useValue: definitivo });
      simularMidia({ [DOBRA_LARGA]: true });
      const fixture = renderizar();
      const hero: HTMLElement = fixture.nativeElement;

      expect(filme(fixture).getAttribute('src')).toBe('hero/definitivo.mp4');
      expect(filme(fixture).poster).toContain('hero/definitivo-inicio.webp');
      expect(hero.querySelector('img')?.getAttribute('src')).toBe('hero/definitivo-fim.webp');
      expect(hero.querySelector('img')?.getAttribute('width')).toBe('1920');
      expect(hero.querySelector('img')?.getAttribute('alt')).toBe('O carnê definitivo');

      filme(fixture).dispatchEvent(new Event('playing'));
      vi.advanceTimersByTime(2999);
      estabilizar();
      expect(palco(fixture).classList).not.toContain('palco--revelada');

      vi.advanceTimersByTime(1);
      estabilizar();
      expect(palco(fixture).classList).toContain('palco--revelada');
    });

    it('deve deslocar a cena e o texto com o ponteiro e soltar quando ele sai', () => {
      simularMidia({ [DOBRA_LARGA]: true });
      const fixture = renderizar();
      const hero: HTMLElement = fixture.nativeElement;
      const cena = hero.querySelector('.hero__cena') as HTMLElement;
      const texto = hero.querySelector('.hero__texto') as HTMLElement;
      vi.spyOn(hero, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 1000, 500));

      hero.dispatchEvent(new PointerEvent('pointermove', { clientX: 900, clientY: 100 }));
      vi.advanceTimersToNextFrame();

      expect(cena.style.transform).toBe(profundidade(0.9, 0.2).cena);
      expect(texto.style.transform).toBe(profundidade(0.9, 0.2).texto);

      hero.dispatchEvent(new PointerEvent('pointerleave'));

      expect(cena.style.transform).toBe('');
      expect(texto.style.transform).toBe('');
    });

    it('deve ignorar o toque e o ponteiro quando não há filme', () => {
      simularMidia({ [DOBRA_LARGA]: true });
      const larga = renderizar();
      const dobra: HTMLElement = larga.nativeElement;
      dobra.dispatchEvent(new PointerEvent('pointermove', { clientX: 9, pointerType: 'touch' }));
      vi.advanceTimersToNextFrame();
      expect((dobra.querySelector('.hero__cena') as HTMLElement).style.transform).toBe('');

      larga.destroy();
      removerMidia();
      TestBed.resetTestingModule();
      const estreita: HTMLElement = renderizar().nativeElement;
      estreita.dispatchEvent(new PointerEvent('pointermove', { clientX: 9 }));
      vi.advanceTimersToNextFrame();
      expect((estreita.querySelector('.hero__cena') as HTMLElement).style.transform).toBe('');
    });

    it('deve cancelar a espera do texto ao sair da página', () => {
      simularMidia({ [DOBRA_LARGA]: true });
      const marcar = vi.spyOn(globalThis, 'setTimeout');
      const desmarcar = vi.spyOn(globalThis, 'clearTimeout');
      const fixture = renderizar();
      const espera =
        marcar.mock.results[marcar.mock.calls.findIndex(([, prazo]) => prazo === 4000)];

      fixture.destroy();

      expect(espera.value).toBeDefined();
      expect(desmarcar).toHaveBeenCalledWith(espera.value);
    });
  });
});
