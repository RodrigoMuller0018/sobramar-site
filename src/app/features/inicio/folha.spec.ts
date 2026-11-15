import { TestBed } from '@angular/core/testing';
import { violacoesDeAcessibilidade } from '../../../testing/acessibilidade';
import { MESES_DO_EXEMPLO, MesDoExemplo } from './dominio/exemplo';
import { Folha, PassoDaLuz } from './folha';

describe('Folha', () => {
  const [marco, , maio] = MESES_DO_EXEMPLO;

  async function renderizar(
    mes: MesDoExemplo,
    luz: PassoDaLuz | null = null,
  ): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(Folha);
    fixture.componentRef.setInput('mes', mes);
    fixture.componentRef.setInput('luz', luz);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('deve ser uma tabela com o mês no título e os blocos Entra e Sai, sem sinais', async () => {
    const folha = await renderizar(marco);
    const grupos = Array.from(folha.querySelectorAll('th[scope="rowgroup"]')).map(
      (th) => th.textContent,
    );

    expect(folha.querySelector('caption')?.textContent?.trim()).toBe('Março de 2027');
    expect(folha.querySelector('.folha__canhoto .so-leitor')?.textContent).toBe('Folha 3 de 12');
    expect(folha.querySelector('.folha__canhoto b')?.textContent).toBe('03');
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

  it('deve escrever a luz a lápis e a tinta no mesmo lugar quando a seção 4 pede', async () => {
    const folha = await renderizar(maio, 'estimado');
    const luz = folha.querySelector('tr.luz') as HTMLElement;
    const valendo = (onde: Element) =>
      Array.from(onde.querySelectorAll('.trocas .vale')).map((texto) => texto.textContent);

    // A mesma folha de maio já está na seção das folhas: o título não pode repetir o id dela.
    expect(folha.getAttribute('aria-labelledby')).toBe('titulo-folha-2027-05-a-lapis');
    expect(folha.querySelector('caption')?.id).toBe('titulo-folha-2027-05-a-lapis');
    expect(folha.querySelector('.folha__corpo')?.getAttribute('data-luz')).toBe('estimado');
    expect(luz.querySelectorAll('.valor .lapis, .valor .tinta')).toHaveLength(2);
    expect(luz.querySelector('.valor .tinta')?.getAttribute('aria-hidden')).toBe('true');
    expect(luz.querySelector('.situacao .so-leitor')?.textContent).toBe('estimado');
    expect(valendo(folha)).toEqual([
      'dia 15, estimado, a conta chega por volta do dia 12',
      maio.estado,
    ]);
  });

  it('deve trocar o motivo e a situação da luz quando a conta chega e quando é paga', async () => {
    const chegou = await renderizar(maio, 'chegou');
    expect(chegou.querySelector('tr.luz .so-leitor')?.textContent).toBe('previsto');
    expect(chegou.querySelector('.trocas .vale')?.textContent).toBe('dia 15, a conta chegou');

    const pago = await renderizar(maio, 'pago');
    expect(pago.querySelector('tr.luz .so-leitor')?.textContent).toBe('pago');
    expect(pago.querySelector('.folha__estado .vale')?.textContent).toBe(
      'estimado: fatura do cartão final 4321 não conferida',
    );
    expect(await violacoesDeAcessibilidade(pago)).toEqual([]);
  });

  it('deve não ter violações de acessibilidade', async () => {
    expect(await violacoesDeAcessibilidade(await renderizar(maio))).toEqual([]);
  });
});
