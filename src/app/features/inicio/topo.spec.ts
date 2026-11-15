import { ComponentFixture, TestBed } from '@angular/core/testing';
import { violacoesDeAcessibilidade } from '../../../testing/acessibilidade';
import { URL_DO_APP } from '../../core/config/urls';
import { Topo } from './topo';

const APP = 'https://app.exemplo.test';

describe('Topo', () => {
  afterEach(() => rolarPara(0));

  async function renderizar(): Promise<ComponentFixture<Topo>> {
    TestBed.configureTestingModule({ providers: [{ provide: URL_DO_APP, useValue: APP }] });
    const fixture = TestBed.createComponent(Topo);
    await fixture.whenStable();
    return fixture;
  }

  function rolarPara(pixels: number): void {
    Object.defineProperty(window, 'scrollY', { value: pixels, configurable: true });
    window.dispatchEvent(new Event('scroll'));
  }

  it('deve levar às folhas, ao login e ao cadastro do app', async () => {
    const barra: HTMLElement = (await renderizar()).nativeElement;
    const destinos = Array.from(barra.querySelectorAll('.topo__nav a, .btn')).map((link) => [
      link.textContent?.trim(),
      link.getAttribute('href'),
    ]);

    expect(barra.querySelector('.marca')?.textContent).toBe('Sobramar');
    expect(destinos).toEqual([
      ['Folhas', '#folhas'],
      ['Entrar', `${APP}/entrar`],
      ['Montar meu carnê', `${APP}/comecar`],
    ]);
  });

  it('deve ficar transparente no alto da página, com o botão quieto', async () => {
    const barra: HTMLElement = (await renderizar()).nativeElement;

    expect(barra.classList).not.toContain('nav--pintada');
    expect(barra.querySelector('.btn')?.classList).toContain('btn--secondary');
  });

  it('deve ganhar fundo com a rolagem e só acender o botão quando o da dobra sai de vista', async () => {
    const fixture = await renderizar();
    const barra: HTMLElement = fixture.nativeElement;

    rolarPara(120);
    await fixture.whenStable();
    expect(barra.classList).toContain('nav--pintada');
    expect(barra.querySelector('.btn')?.classList).toContain('btn--secondary');

    rolarPara(window.innerHeight * 0.6 + 1);
    await fixture.whenStable();
    expect(barra.classList).toContain('nav--com-acao');
    expect(barra.querySelector('.btn')?.classList).toContain('btn--primary');

    rolarPara(0);
    await fixture.whenStable();
    expect(barra.classList).not.toContain('nav--pintada');
    expect(barra.querySelector('.btn')?.classList).not.toContain('btn--primary');
  });

  it('deve já nascer pintada quando a página abre no meio', async () => {
    rolarPara(600);

    expect((await renderizar()).nativeElement.classList).toContain('nav--pintada');
  });

  it('deve parar de ouvir a rolagem ao sair da página', async () => {
    const fixture = await renderizar();
    const parar = vi.spyOn(window, 'removeEventListener');

    fixture.destroy();

    expect(parar).toHaveBeenCalledWith('scroll', expect.any(Function));
    parar.mockRestore();
  });

  it('deve não ter violações de acessibilidade', async () => {
    expect(await violacoesDeAcessibilidade((await renderizar()).nativeElement)).toEqual([]);
  });
});
