import { TestBed } from '@angular/core/testing';
import {
  MENOS_MOVIMENTO,
  limparMovimento,
  removerMidia,
  simularMidia,
} from '../../../testing/midia';
import { CHAVE_DO_MOVIMENTO, MovimentoService } from './movimento.service';

describe('MovimentoService', () => {
  afterEach(() => {
    removerMidia();
    limparMovimento();
    vi.restoreAllMocks();
  });

  function iniciar(): MovimentoService {
    const servico = TestBed.inject(MovimentoService);
    TestBed.tick();
    return servico;
  }

  it('deve ficar parado até a primeira pintura no navegador', () => {
    const servico = TestBed.inject(MovimentoService);

    expect(servico.decidido()).toBe(false);
    expect(servico.permitido()).toBe(false);

    TestBed.tick();
    expect(servico.decidido()).toBe(true);
    expect(servico.permitido()).toBe(true);
  });

  it('deve respeitar o pedido de menos movimento do sistema', () => {
    simularMidia({ [MENOS_MOVIMENTO]: true });
    const servico = iniciar();

    expect(servico.sistemaReduz()).toBe(true);
    expect(servico.permitido()).toBe(false);
  });

  it('deve deixar a pessoa ligar e desligar o movimento por conta própria', () => {
    simularMidia({ [MENOS_MOVIMENTO]: true });
    const servico = iniciar();

    servico.alternar();
    expect(servico.permitido()).toBe(true);

    servico.alternar();
    expect(servico.permitido()).toBe(false);
  });

  it('deve deixar a pessoa desligar o movimento mesmo sem o sistema pedir', () => {
    const servico = iniciar();

    servico.alternar();

    expect(servico.permitido()).toBe(false);
    expect(localStorage.getItem(CHAVE_DO_MOVIMENTO)).toBe('desligado');
  });

  it('deve lembrar a escolha na visita seguinte', () => {
    simularMidia({ [MENOS_MOVIMENTO]: true });
    iniciar().alternar();
    expect(localStorage.getItem(CHAVE_DO_MOVIMENTO)).toBe('ligado');

    TestBed.resetTestingModule();

    expect(iniciar().permitido()).toBe(true);
  });

  it('deve ignorar um valor guardado que não conhece', () => {
    localStorage.setItem(CHAVE_DO_MOVIMENTO, 'talvez');
    simularMidia({ [MENOS_MOVIMENTO]: true });

    expect(iniciar().permitido()).toBe(false);
  });

  it('deve avisar o CSS pelo atributo do documento', () => {
    simularMidia({ [MENOS_MOVIMENTO]: true });
    const servico = iniciar();
    expect(document.documentElement.dataset['movimento']).toBe('desligado');

    servico.alternar();
    TestBed.tick();

    expect(document.documentElement.dataset['movimento']).toBe('ligado');
  });

  it('deve seguir funcionando quando o navegador nega o armazenamento', () => {
    const negar = () => {
      throw new Error('armazenamento negado');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(negar);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(negar);
    const servico = iniciar();

    servico.alternar();

    expect(servico.permitido()).toBe(false);
  });

  it('deve acompanhar a mudança da preferência do sistema', () => {
    const midia = simularMidia({ [MENOS_MOVIMENTO]: false });
    const servico = iniciar();
    expect(servico.permitido()).toBe(true);

    midia.mudar(MENOS_MOVIMENTO, true);

    expect(servico.permitido()).toBe(false);
  });
});
