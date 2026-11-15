import { TestBed } from '@angular/core/testing';
import { violacoesDeAcessibilidade } from '../../../testing/acessibilidade';
import { Confianca } from './confianca';

describe('Confianca', () => {
  async function renderizar(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(Confianca);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('deve separar o que o app guarda do que ele nunca pede', async () => {
    const secao = await renderizar();
    const colunas = Array.from(secao.querySelectorAll('.confianca__colunas > div')).map(
      (coluna) => coluna.querySelector('h3')?.textContent,
    );

    expect(colunas).toEqual(['Guarda', 'Nunca pede']);
    expect(secao.textContent).toContain('Senha de banco');
    expect(secao.textContent).toContain('cartão final 4321');
    expect(await violacoesDeAcessibilidade(secao)).toEqual([]);
  });
});
