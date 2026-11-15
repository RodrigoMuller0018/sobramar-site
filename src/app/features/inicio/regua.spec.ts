import { ComponentFixture, TestBed } from '@angular/core/testing';
import { violacoesDeAcessibilidade } from '../../../testing/acessibilidade';
import {
  MENOS_MOVIMENTO,
  limparMovimento,
  removerMidia,
  simularMidia,
} from '../../../testing/midia';
import { Regua } from './regua';

/** Uma animação de mentira: o jsdom não tem `element.animate`. */
function animacaoFalsa() {
  return { cancel: vi.fn(), pause: vi.fn() };
}

describe('Regua', () => {
  let avisar: (entradas: { isIntersecting: boolean }[]) => void = () => undefined;
  const observar = vi.fn();
  const desligar = vi.fn();
  const animar = vi.fn(() => animacaoFalsa());

  beforeEach(() => {
    vi.clearAllMocks();
    simularMidia({});
    Object.defineProperty(HTMLElement.prototype, 'animate', { value: animar, configurable: true });
    class ObservadorFalso {
      constructor(chamar: typeof avisar) {
        avisar = chamar;
      }
      observe = observar;
      disconnect = desligar;
    }
    vi.stubGlobal('IntersectionObserver', ObservadorFalso);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(HTMLElement.prototype, 'animate');
    removerMidia();
    limparMovimento();
  });

  /** Renderiza com o relógio de verdade e só então congela os `setTimeout` do roteiro. */
  async function renderizar(): Promise<ComponentFixture<Regua>> {
    const fixture = TestBed.createComponent(Regua);
    await fixture.whenStable();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    return fixture;
  }

  /** Corre o relógio falso e volta ao de verdade para o Angular poder atualizar a tela. */
  async function passar(fixture: ComponentFixture<Regua>, milissegundos: number): Promise<void> {
    vi.advanceTimersByTime(milissegundos);
    vi.useRealTimers();
    await fixture.whenStable();
  }

  const sobras = (elemento: HTMLElement) =>
    Array.from(elemento.querySelectorAll('.regua__sobra')).map((celula) =>
      celula.textContent?.trim(),
    );

  it('deve mostrar uma faixa por trecho e a sobra de cada mês com a geladeira', async () => {
    simularMidia({ [MENOS_MOVIMENTO]: true });
    const fixture = await renderizar();
    const elemento: HTMLElement = fixture.nativeElement;
    const nova = elemento.querySelector('.faixa--nova') as HTMLElement;

    expect(elemento.querySelectorAll('.regua__mes')).toHaveLength(12);
    expect(
      Array.from(elemento.querySelectorAll('.faixa--curta')).map((faixa) =>
        faixa.textContent?.trim(),
      ),
    ).toEqual(['R$ 1.550,00', 'R$ 180,00', 'R$ 1.200,00', 'R$ 50,00']);
    expect(nova.textContent?.trim()).toBe('R$ 200,00, 6 de 6 parcelas');
    expect(nova.style.gridColumn).toBe('6 / 12');
    expect(sobras(elemento).slice(2, 6)).toEqual([
      'R$ 1.680,10',
      'R$ 2.880,10',
      'R$ 2.680,10',
      'R$ 2.680,10',
    ]);
    expect(elemento.querySelectorAll('.regua__sobra--mudou')).toHaveLength(6);
    expect(elemento.querySelector('.regua__texto button')).toBeNull();
    expect(animar).not.toHaveBeenCalled();
    vi.useRealTimers();
    expect(await violacoesDeAcessibilidade(elemento)).toEqual([]);
  });

  it('deve esperar a régua entrar na tela e então estender a geladeira, trocando as sobras', async () => {
    const fixture = await renderizar();
    const elemento: HTMLElement = fixture.nativeElement;

    expect(observar).toHaveBeenCalledTimes(1);
    expect(sobras(elemento)[4]).toBe('R$ 2.880,10');

    avisar([{ isIntersecting: true }]);
    expect(desligar).toHaveBeenCalled();
    await passar(fixture, 3000);

    expect(sobras(elemento)[4]).toBe('R$ 2.680,10');
    expect(sobras(elemento)[9]).toBe('R$ 2.680,10');
    expect(elemento.querySelectorAll('.regua__mes--aceso')).toHaveLength(0);
  });

  it('deve acender o mês enquanto a sobra dele troca', async () => {
    const fixture = await renderizar();
    avisar([{ isIntersecting: true }]);

    await passar(fixture, 1000);

    expect(fixture.nativeElement.querySelectorAll('.regua__mes--aceso').length).toBeGreaterThan(0);
  });

  it('deve repetir só a geladeira pelo botão', async () => {
    const fixture = await renderizar();
    const elemento: HTMLElement = fixture.nativeElement;
    avisar([{ isIntersecting: true }]);
    await passar(fixture, 3000);
    animar.mockClear();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    (elemento.querySelector('.regua__texto button') as HTMLButtonElement).click();
    vi.useRealTimers();
    await fixture.whenStable();

    expect(sobras(elemento)[4]).toBe('R$ 2.880,10');
    // Só a geladeira: estender e assentar; nenhuma faixa comum é riscada de novo.
    expect(animar).toHaveBeenCalledTimes(2);
  });

  it('deve ignorar o aviso de quem ainda não entrou na tela', async () => {
    await renderizar();

    avisar([{ isIntersecting: false }]);

    expect(desligar).not.toHaveBeenCalled();
  });

  it('deve deixar a régua pronta quando o navegador não sabe animar', async () => {
    Reflect.deleteProperty(HTMLElement.prototype, 'animate');
    const fixture = await renderizar();

    expect(observar).not.toHaveBeenCalled();
    expect(sobras(fixture.nativeElement)[4]).toBe('R$ 2.680,10');
  });

  it('deve parar tudo e mostrar a régua pronta ao sair da página', async () => {
    const fixture = await renderizar();
    avisar([{ isIntersecting: true }]);

    fixture.destroy();
    vi.advanceTimersByTime(3000);

    expect(desligar).toHaveBeenCalled();
  });
});
