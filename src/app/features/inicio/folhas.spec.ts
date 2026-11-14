import { ComponentFixture, TestBed } from '@angular/core/testing';
import { violacoesDeAcessibilidade } from '../../../testing/acessibilidade';
import { CABE_A_CENA, MENOS_MOVIMENTO, removerMidia, simularMidia } from '../../../testing/midia';
import { CRIAR_CENA, OpcoesDaCena } from '../../core/movimento/cena-de-rolagem';
import { Folhas } from './folhas';

describe('Folhas', () => {
  const cena = { irPara: vi.fn(), destruir: vi.fn() };
  const criarCena = vi.fn();
  let opcoes: OpcoesDaCena | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    opcoes = undefined;
    criarCena.mockImplementation((recebidas: OpcoesDaCena) => {
      opcoes = recebidas;
      return Promise.resolve(cena);
    });
    TestBed.configureTestingModule({ providers: [{ provide: CRIAR_CENA, useValue: criarCena }] });
  });

  afterEach(() => removerMidia());

  async function renderizar(): Promise<ComponentFixture<Folhas>> {
    const fixture = TestBed.createComponent(Folhas);
    await fixture.whenStable();
    return fixture;
  }

  const botoes = (elemento: HTMLElement) =>
    Array.from(elemento.querySelectorAll<HTMLButtonElement>('.meses__botao'));
  const pressionados = (elemento: HTMLElement) =>
    botoes(elemento).map((botao) => botao.getAttribute('aria-pressed'));

  it('deve trocar a folha pelos botões quando a cena não cabe na tela', async () => {
    const fixture = await renderizar();
    const elemento: HTMLElement = fixture.nativeElement;

    expect(criarCena).not.toHaveBeenCalled();
    expect(elemento.querySelectorAll('article.folha')).toHaveLength(3);
    expect(elemento.querySelector('.folha--ativa')?.id).toBe('folha-2027-03');
    expect(elemento.querySelector('.folhas__nota')?.textContent).toContain('IPVA');

    botoes(elemento)[2].click();
    await fixture.whenStable();

    expect(elemento.querySelector('.folha--ativa')?.id).toBe('folha-2027-05');
    expect(pressionados(elemento)).toEqual(['false', 'false', 'true']);
    expect(elemento.querySelector('.folhas__nota')?.textContent).toContain('geladeira');
    expect(await violacoesDeAcessibilidade(elemento)).toEqual([]);
  });

  it('deve virar as folhas pela rolagem quando há movimento e espaço', async () => {
    simularMidia({ [CABE_A_CENA]: true });
    const fixture = await renderizar();
    const elemento: HTMLElement = fixture.nativeElement;
    const papeis = Array.from(elemento.querySelectorAll<HTMLElement>('article.folha'));

    expect(criarCena).toHaveBeenCalledTimes(1);
    expect(opcoes?.secao).toBe(elemento);

    opcoes?.aoProgredir(0.25);
    expect(papeis[0].style.transform).toContain('rotateY(-44deg)');
    expect(papeis[0].style.opacity).toBe('1');
    expect(papeis[1].style.transform).toContain('translate3d(13px, 8px, -35px)');
    expect(papeis[1].style.filter).toBe('brightness(0.9) blur(0.6px)');

    opcoes?.aoChegar?.(0);
    expect(elemento.querySelector<HTMLElement>('.folhas__pilha')?.style.transform).toContain(
      'rotateX(24deg)',
    );

    opcoes?.aoProgredir(1);
    await fixture.whenStable();
    expect(papeis[0].style.pointerEvents).toBe('none');
    expect(pressionados(elemento)).toEqual(['false', 'false', 'true']);
  });

  it('deve levar a rolagem até o mês quando o botão é usado na cena', async () => {
    simularMidia({ [CABE_A_CENA]: true });
    const fixture = await renderizar();

    botoes(fixture.nativeElement)[1].click();

    expect(cena.irPara).toHaveBeenCalledWith(0.5);
  });

  it('deve sair da cena e limpar as folhas quando a tela encolhe', async () => {
    const midia = simularMidia({ [CABE_A_CENA]: true });
    const fixture = await renderizar();
    const papel = fixture.nativeElement.querySelector('article.folha') as HTMLElement;
    opcoes?.aoProgredir(0.25);

    opcoes?.aoChegar?.(0.5);

    midia.mudar(CABE_A_CENA, false);
    await fixture.whenStable();

    expect(cena.destruir).toHaveBeenCalledTimes(1);
    expect(papel.style.transform).toBe('');
    expect(papel.style.filter).toBe('');
    expect(fixture.nativeElement.querySelector('.folhas__pilha').style.transform).toBe('');
  });

  it('deve ficar parada com menos movimento e oferecer o botão para ligar a rolagem', async () => {
    simularMidia({ [CABE_A_CENA]: true, [MENOS_MOVIMENTO]: true });
    const fixture = await renderizar();
    const elemento: HTMLElement = fixture.nativeElement;
    const ligar = elemento.querySelector('.folhas__texto .btn') as HTMLButtonElement;

    expect(criarCena).not.toHaveBeenCalled();
    expect(ligar.textContent).toContain('Virar as folhas com a rolagem');

    ligar.click();
    await fixture.whenStable();

    expect(criarCena).toHaveBeenCalledTimes(1);
    expect(elemento.classList).toContain('folhas--ligada');
    expect(ligar.getAttribute('aria-pressed')).toBe('true');
  });

  it('deve cair para os botões se a cena não carregar', async () => {
    simularMidia({ [CABE_A_CENA]: true });
    criarCena.mockRejectedValue(new Error('sem rede'));
    const fixture = await renderizar();
    await fixture.whenStable();

    expect(fixture.nativeElement.classList).toContain('folhas--estatica');
  });

  it('deve destruir a cena ao sair da página', async () => {
    simularMidia({ [CABE_A_CENA]: true });
    const fixture = await renderizar();

    fixture.destroy();

    expect(cena.destruir).toHaveBeenCalledTimes(1);
  });
  it('deve rolar a página por conta própria enquanto o motor da cena carrega', async () => {
    simularMidia({ [CABE_A_CENA]: true });
    criarCena.mockReturnValue(new Promise(() => undefined));
    const rolar = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const fixture = await renderizar();

    botoes(fixture.nativeElement)[2].click();

    expect(rolar).toHaveBeenCalledTimes(1);
    rolar.mockRestore();
  });

  it('deve descartar a cena que chega depois de a página ser fechada', async () => {
    simularMidia({ [CABE_A_CENA]: true });
    let entregar: (valor: typeof cena) => void = () => undefined;
    criarCena.mockReturnValue(new Promise((resolver) => (entregar = resolver)));
    const fixture = await renderizar();

    fixture.destroy();
    entregar(cena);
    await Promise.resolve();

    expect(cena.destruir).toHaveBeenCalledTimes(1);
  });
});
