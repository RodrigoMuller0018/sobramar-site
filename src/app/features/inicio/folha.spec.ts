import { TestBed } from '@angular/core/testing';
import { violacoesDeAcessibilidade } from '../../../testing/acessibilidade';
import { MESES_DO_EXEMPLO, MesDoExemplo } from './dominio/exemplo';
import { Folha } from './folha';

describe('Folha', () => {
  const [marco, , maio] = MESES_DO_EXEMPLO;

  async function renderizar(mes: MesDoExemplo): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(Folha);
    fixture.componentRef.setInput('mes', mes);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('deve ser uma tabela com o mês no título e os blocos Entra e Sai, sem sinais', async () => {
    const folha = await renderizar(marco);
    const grupos = Array.from(folha.querySelectorAll('th[scope="rowgroup"]')).map(
      (th) => th.textContent,
    );

    expect(folha.querySelector('caption')?.textContent?.trim()).toBe('Março de 2027');
    expect(folha.querySelector('.folha__numero')?.textContent).toBe('Folha 3 de 12');
    expect(grupos).toEqual(['Entra', 'Sai']);
    expect(folha.querySelectorAll('tbody th[scope="row"]')).toHaveLength(7);
    expect(folha.querySelector('table')?.textContent).not.toMatch(/[+−-]\s?R\$/);
  });

  it('deve carimbar o que foi pago e mostrar a sobra em tinta num mês conferido', async () => {
    const folha = await renderizar(marco);

    expect(folha.querySelectorAll('.carimbo')).toHaveLength(6);
    expect(folha.querySelector('.folha__sobra strong')?.textContent).toBe('R$ 1.680,10');
    expect(folha.querySelector('.folha__estado')?.textContent).toContain('firme');
    expect(folha.classList).not.toContain('folha--a-lapis');
  });

  it('deve deixar a lápis o mês com estimativa, com o motivo na linha', async () => {
    const folha = await renderizar(maio);

    expect(folha.classList).toContain('folha--a-lapis');
    expect(folha.querySelectorAll('.carimbo')).toHaveLength(1);
    expect(folha.querySelector('tr.estimada')?.textContent).toContain('estimado, a conta chega');
    expect(folha.querySelector('.folha__sobra strong')?.textContent).toBe('R$ 2.680,10');
    expect(folha.getAttribute('aria-labelledby')).toBe('titulo-folha-2027-05');
  });

  it('deve não ter violações de acessibilidade', async () => {
    expect(await violacoesDeAcessibilidade(await renderizar(maio))).toEqual([]);
  });
});
