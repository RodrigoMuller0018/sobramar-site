import { TestBed } from '@angular/core/testing';
import { MENOS_MOVIMENTO, removerMidia, simularMidia } from '../../../testing/midia';
import { MovimentoService } from './movimento.service';

describe('MovimentoService', () => {
  afterEach(() => removerMidia());

  it('deve ficar parado até a primeira pintura no navegador', () => {
    const servico = TestBed.inject(MovimentoService);

    expect(servico.permitido()).toBe(false);

    TestBed.tick();
    expect(servico.permitido()).toBe(true);
  });

  it('deve respeitar o pedido de menos movimento do sistema', () => {
    simularMidia({ [MENOS_MOVIMENTO]: true });
    const servico = TestBed.inject(MovimentoService);
    TestBed.tick();

    expect(servico.sistemaReduz()).toBe(true);
    expect(servico.permitido()).toBe(false);
  });

  it('deve deixar a pessoa ligar e desligar o movimento por conta própria', () => {
    simularMidia({ [MENOS_MOVIMENTO]: true });
    const servico = TestBed.inject(MovimentoService);
    TestBed.tick();

    servico.alternar();
    expect(servico.ligado()).toBe(true);
    expect(servico.permitido()).toBe(true);

    servico.alternar();
    expect(servico.permitido()).toBe(false);
  });

  it('deve acompanhar a mudança da preferência do sistema', () => {
    const midia = simularMidia({ [MENOS_MOVIMENTO]: false });
    const servico = TestBed.inject(MovimentoService);
    TestBed.tick();
    expect(servico.permitido()).toBe(true);

    midia.mudar(MENOS_MOVIMENTO, true);

    expect(servico.permitido()).toBe(false);
  });
});
