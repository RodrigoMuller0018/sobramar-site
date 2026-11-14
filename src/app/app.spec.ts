import { TestBed } from '@angular/core/testing';
import { violacoesDeAcessibilidade } from '../testing/acessibilidade';
import { App } from './app';
import { URL_DO_APP } from './core/config/urls';
import { CRIAR_CENA } from './core/movimento/cena-de-rolagem';

const APP = 'https://app.exemplo.test';

describe('App', () => {
  async function renderizar(): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      providers: [
        { provide: URL_DO_APP, useValue: APP },
        { provide: CRIAR_CENA, useValue: () => Promise.reject(new Error('sem cena no teste')) },
      ],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('deve montar a página com a barra, as seis seções na ordem e o fecho', async () => {
    const pagina = await renderizar();
    const secoes = Array.from(pagina.querySelectorAll('main > section'));

    expect(pagina.querySelector('header.nav')).not.toBeNull();
    expect(pagina.querySelector('main')?.id).toBe('conteudo');
    expect(secoes.slice(1).map((secao) => secao.id)).toEqual([
      'folhas',
      'sozinho',
      'lapis',
      'antes',
      'confianca',
    ]);
    expect(pagina.querySelectorAll('main h2')).toHaveLength(5);
    expect(pagina.querySelector('footer.closing h2')?.textContent).toBe(
      'Quatro perguntas montam o carnê',
    );
  });

  it('deve dar o mesmo nome e o mesmo destino à ação principal em toda a página', async () => {
    const pagina = await renderizar();
    const acoes = Array.from(pagina.querySelectorAll<HTMLAnchorElement>('a.btn')).filter(
      (botao) => botao.getAttribute('href') === `${APP}/comecar`,
    );

    expect(acoes.map((botao) => botao.textContent?.trim())).toEqual([
      'Montar meu carnê',
      'Montar meu carnê',
      'Montar meu carnê',
    ]);
  });

  it('deve ter um só botão âmbar por tela no alto da página: o da dobra e o do fecho', async () => {
    const principais = Array.from((await renderizar()).querySelectorAll('.btn--primary'));

    expect(principais.map((botao) => botao.closest('section, footer')?.className)).toEqual([
      'hero',
      'closing',
    ]);
  });

  it('deve levar ao login e aos textos legais do app', async () => {
    const pagina = await renderizar();
    const rodape = Array.from(pagina.querySelectorAll('.fecho__links a')).map((link) =>
      link.getAttribute('href'),
    );

    expect(pagina.querySelector('.topo__nav a:last-child')?.getAttribute('href')).toBe(
      `${APP}/entrar`,
    );
    expect(rodape).toEqual([`${APP}/entrar`, `${APP}/privacidade`, `${APP}/termos`]);
    expect(pagina.querySelector('.fecho__legal')?.textContent).toContain('gerada por computador');
  });

  it('deve não ter violações de acessibilidade', async () => {
    expect(await violacoesDeAcessibilidade(await renderizar())).toEqual([]);
  });
});
