import { TestBed } from '@angular/core/testing';
import { violacoesDeAcessibilidade } from '../../../testing/acessibilidade';
import { URL_DO_APP } from '../../core/config/urls';
import { Hero } from './hero';

describe('Hero', () => {
  async function renderizar(): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      providers: [{ provide: URL_DO_APP, useValue: 'https://app.exemplo.test' }],
    });
    const fixture = TestBed.createComponent(Hero);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('deve dizer o que é, para quem e trazer um fato do exemplo', async () => {
    const hero = await renderizar();

    expect(hero.querySelector('h1')?.textContent).toBe('O carnê dos seus próximos 12 meses');
    expect(hero.querySelector('.lead')?.textContent).toContain('recebe salário e parcela');
    expect(hero.querySelector('.lead')?.textContent).toContain('R$ 2.680,10');
  });

  it('deve ter só dois botões: montar o carnê no app e ver as folhas', async () => {
    const botoes = Array.from((await renderizar()).querySelectorAll<HTMLAnchorElement>('.btn'));

    expect(botoes.map((botao) => botao.textContent)).toEqual(['Montar meu carnê', 'Ver as folhas']);
    expect(botoes.map((botao) => botao.getAttribute('href'))).toEqual([
      'https://app.exemplo.test/comecar',
      '#folhas',
    ]);
  });

  it('deve descrever a foto e não ter violações de acessibilidade', async () => {
    const hero = await renderizar();

    expect(hero.querySelector('img')?.getAttribute('alt')).toContain('Carnê de papel');
    expect(await violacoesDeAcessibilidade(hero)).toEqual([]);
  });
});
