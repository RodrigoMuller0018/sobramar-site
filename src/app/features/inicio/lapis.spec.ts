import { ComponentFixture, TestBed } from '@angular/core/testing';
import { violacoesDeAcessibilidade } from '../../../testing/acessibilidade';
import {
  MENOS_MOVIMENTO,
  limparMovimento,
  removerMidia,
  simularMidia,
} from '../../../testing/midia';
import { Lapis } from './lapis';

const COM_PONTEIRO = '(hover: hover) and (pointer: fine)';

describe('Lapis', () => {
  const animar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(HTMLElement.prototype, 'animate', { value: animar, configurable: true });
  });

  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, 'animate');
    removerMidia();
    limparMovimento();
  });

  async function renderizar(): Promise<ComponentFixture<Lapis>> {
    const fixture = TestBed.createComponent(Lapis);
    await fixture.whenStable();
    return fixture;
  }

  const botao = (elemento: HTMLElement, indice: number) =>
    elemento.querySelectorAll<HTMLButtonElement>('.lapis__passos button')[indice];
  const corpo = (elemento: HTMLElement) => elemento.querySelector('.folha__corpo') as HTMLElement;

  it('deve começar a lápis, com só o primeiro passo disponível', async () => {
    simularMidia({});
    const fixture = await renderizar();
    const elemento: HTMLElement = fixture.nativeElement;

    expect(corpo(elemento).dataset['luz']).toBe('estimado');
    expect([0, 1, 2].map((indice) => botao(elemento, indice).disabled)).toEqual([
      false,
      true,
      true,
    ]);
    expect(elemento.querySelector('.lapis__nota')?.textContent).toContain(
      'a conta ainda não chegou',
    );
    expect(await violacoesDeAcessibilidade(elemento)).toEqual([]);
  });

  it('deve passar a tinta, carimbar e voltar, levando o foco ao próximo passo', async () => {
    simularMidia({});
    const fixture = await renderizar();
    const elemento: HTMLElement = fixture.nativeElement;

    botao(elemento, 0).click();
    await fixture.whenStable();
    expect(corpo(elemento).dataset['luz']).toBe('chegou');
    expect(document.activeElement).toBe(botao(elemento, 1));

    botao(elemento, 1).click();
    await fixture.whenStable();
    expect(corpo(elemento).dataset['luz']).toBe('pago');
    expect(elemento.querySelector('.lapis__nota')?.textContent).toContain('o app não paga nada');
    expect(animar).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(botao(elemento, 2));

    botao(elemento, 2).click();
    await fixture.whenStable();
    expect(corpo(elemento).dataset['luz']).toBe('estimado');
    expect(document.activeElement).toBe(botao(elemento, 0));
  });

  it('deve dar baixa sem o papel ceder quando não há movimento', async () => {
    simularMidia({ [MENOS_MOVIMENTO]: true });
    const fixture = await renderizar();
    const elemento: HTMLElement = fixture.nativeElement;

    botao(elemento, 0).click();
    await fixture.whenStable();
    botao(elemento, 1).click();
    await fixture.whenStable();

    expect(corpo(elemento).dataset['luz']).toBe('pago');
    expect(animar).not.toHaveBeenCalled();
  });

  it('deve inclinar a folha na direção do ponteiro e endireitar quando ele sai', async () => {
    simularMidia({ [COM_PONTEIRO]: true });
    const fixture = await renderizar();
    const elemento: HTMLElement = fixture.nativeElement;
    const mesa = elemento.querySelector('.lapis__mesa') as HTMLElement;
    const folha = elemento.querySelector('article.folha') as HTMLElement;
    vi.spyOn(mesa, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    } as DOMRect);

    mesa.dispatchEvent(new MouseEvent('pointermove', { clientX: 100, clientY: 0 }));
    expect(folha.style.transform).toBe('rotateX(2.5deg) rotateY(3.5deg)');

    mesa.dispatchEvent(new MouseEvent('pointerleave'));
    expect(folha.style.transform).toBe('');
  });

  it('deve não inclinar a folha no toque', async () => {
    simularMidia({});
    const fixture = await renderizar();
    const elemento: HTMLElement = fixture.nativeElement;
    const mesa = elemento.querySelector('.lapis__mesa') as HTMLElement;

    mesa.dispatchEvent(new MouseEvent('pointermove', { clientX: 10, clientY: 10 }));

    expect((elemento.querySelector('article.folha') as HTMLElement).style.transform).toBe('');
  });
});
