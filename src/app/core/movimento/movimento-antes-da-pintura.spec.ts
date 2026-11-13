import { TestBed } from '@angular/core/testing';
import roteiro from '../../../../public/movimento.js' with { loader: 'text' };
import {
  MENOS_MOVIMENTO,
  limparMovimento,
  removerMidia,
  simularMidia,
} from '../../../testing/midia';
import { CHAVE_DO_MOVIMENTO, MovimentoService } from './movimento.service';

/**
 * `public/movimento.js` decide antes da primeira pintura; o serviço decide quando o Angular
 * acorda. Se os dois discordarem, a página pisca ao carregar. Estes testes rodam o arquivo de verdade.
 */
describe('movimento.js', () => {
  afterEach(() => {
    removerMidia();
    limparMovimento();
    vi.restoreAllMocks();
  });

  function decidirAntesDaPintura(): string | undefined {
    new Function(roteiro)();
    return document.documentElement.dataset['movimento'];
  }

  it.each([
    { guardado: null, sistemaPedeMenos: false, esperado: 'ligado' },
    { guardado: null, sistemaPedeMenos: true, esperado: 'desligado' },
    { guardado: 'ligado', sistemaPedeMenos: true, esperado: 'ligado' },
    { guardado: 'desligado', sistemaPedeMenos: false, esperado: 'desligado' },
    { guardado: 'talvez', sistemaPedeMenos: false, esperado: 'ligado' },
    { guardado: 'talvez', sistemaPedeMenos: true, esperado: 'desligado' },
  ])(
    'deve decidir $esperado como o serviço (guardado: $guardado, sistema pede menos: $sistemaPedeMenos)',
    ({ guardado, sistemaPedeMenos, esperado }) => {
      if (guardado) {
        localStorage.setItem(CHAVE_DO_MOVIMENTO, guardado);
      }
      simularMidia({ [MENOS_MOVIMENTO]: sistemaPedeMenos });

      const antesDaPintura = decidirAntesDaPintura();
      const servico = TestBed.inject(MovimentoService);
      TestBed.tick();

      expect(antesDaPintura).toBe(esperado);
      expect(servico.permitido()).toBe(esperado === 'ligado');
      expect(document.documentElement.dataset['movimento']).toBe(esperado);
    },
  );

  it('deve seguir só o pedido do sistema quando o navegador nega o armazenamento', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('armazenamento negado');
    });
    simularMidia({ [MENOS_MOVIMENTO]: true });

    expect(decidirAntesDaPintura()).toBe('desligado');
  });

  it('deve ler a mesma chave que o serviço grava', () => {
    expect(roteiro).toContain(`'${CHAVE_DO_MOVIMENTO}'`);
  });
});
