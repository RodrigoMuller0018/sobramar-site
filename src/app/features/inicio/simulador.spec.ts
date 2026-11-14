import { ComponentFixture, TestBed } from '@angular/core/testing';
import { violacoesDeAcessibilidade } from '../../../testing/acessibilidade';
import {
  MENOS_MOVIMENTO,
  limparMovimento,
  removerMidia,
  simularMidia,
} from '../../../testing/midia';
import { Simulador } from './simulador';

describe('Simulador', () => {
  const animar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    simularMidia({});
    Object.defineProperty(HTMLElement.prototype, 'animate', { value: animar, configurable: true });
  });

  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, 'animate');
    removerMidia();
    limparMovimento();
  });

  async function renderizar(): Promise<ComponentFixture<Simulador>> {
    const fixture = TestBed.createComponent(Simulador);
    await fixture.whenStable();
    return fixture;
  }

  const linhas = (elemento: HTMLElement) =>
    Array.from(elemento.querySelectorAll('tbody tr')).map((linha) =>
      Array.from(linha.children).map((celula) => celula.textContent?.trim()),
    );
  const resumo = (elemento: HTMLElement) =>
    elemento.querySelector('.simulador__resumo')?.textContent?.trim();

  async function digitar(fixture: ComponentFixture<Simulador>, valor: string): Promise<void> {
    const campo = fixture.nativeElement.querySelector('#valor-da-compra') as HTMLInputElement;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function parcelar(fixture: ComponentFixture<Simulador>, vezes: number): Promise<void> {
    const campo = fixture.nativeElement.querySelector('#vezes') as HTMLInputElement;
    campo.value = String(vezes);
    campo.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  it('deve começar com R$ 1.800,00 em 6 vezes, de junho a dezembro', async () => {
    const fixture = await renderizar();
    const elemento: HTMLElement = fixture.nativeElement;

    expect(linhas(elemento)[0]).toEqual(['Junho', 'R$ 300,00', 'R$ 2.680,10', 'R$ 2.380,10']);
    expect(linhas(elemento)[6]).toEqual(['Dezembro', 'sem parcela', 'R$ 5.380,10', 'R$ 5.380,10']);
    expect(elemento.querySelectorAll('tbody tr.intacto')).toHaveLength(1);
    expect(resumo(elemento)).toBe(
      '6 parcelas de R$ 300,00, a partir de junho. Em junho a sobra cai de R$ 2.680,10 para R$ 2.380,10.',
    );
    expect(animar).not.toHaveBeenCalled();
    expect(await violacoesDeAcessibilidade(elemento)).toEqual([]);
  });

  it('deve responder às parcelas e contar as que ficam para 2028', async () => {
    const fixture = await renderizar();
    const elemento: HTMLElement = fixture.nativeElement;

    await parcelar(fixture, 10);

    expect(elemento.querySelector('output')?.textContent).toBe('10');
    expect(linhas(elemento)[0][1]).toBe('R$ 180,00');
    expect(resumo(elemento)).toContain('3 parcelas ficam para 2028, fora deste carnê.');
    expect(animar).toHaveBeenCalled();
  });

  it('deve falar da compra à vista e de uma parcela só para 2028', async () => {
    const fixture = await renderizar();

    await parcelar(fixture, 1);
    expect(resumo(fixture.nativeElement)).toBe(
      'À vista no cartão: a sobra de junho cai R$ 1.800,00, de R$ 2.680,10 para R$ 880,10.',
    );

    await parcelar(fixture, 8);
    expect(resumo(fixture.nativeElement)).toContain('1 parcela fica para 2028');
  });

  it('deve dizer quanto falta quando a compra passa da sobra', async () => {
    const fixture = await renderizar();

    await digitar(fixture, '20.000,00');

    // 6 parcelas de R$ 3.333,33; os 2 centavos de resto vão na primeira, de R$ 3.333,35.
    expect(linhas(fixture.nativeElement)[0][3]).toBe('faltam R$ 653,25');
  });

  it('deve pedir um valor quando o campo fica vazio', async () => {
    const fixture = await renderizar();

    await digitar(fixture, '');

    expect(resumo(fixture.nativeElement)).toBe('Digite um valor para ver a diferença.');
    expect(fixture.nativeElement.querySelectorAll('tbody tr.intacto')).toHaveLength(7);
  });

  it('deve trocar os números sem animar quando não há movimento', async () => {
    simularMidia({ [MENOS_MOVIMENTO]: true });
    const fixture = await renderizar();

    await parcelar(fixture, 3);

    expect(linhas(fixture.nativeElement)[0][1]).toBe('R$ 600,00');
    expect(animar).not.toHaveBeenCalled();
  });
});
