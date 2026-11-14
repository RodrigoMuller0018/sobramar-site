import { MESES_DO_EXEMPLO, sobraCentavos } from './exemplo';
import {
  ENTRADAS,
  HOJE,
  SAIDAS,
  faixasDaRegra,
  lerCentavos,
  projetar,
  simularCompra,
  valorNoMes,
} from './projecao';

describe('projecao', () => {
  const regra = (nome: string) => SAIDAS.find((atual) => atual.nome === nome)!;
  const geladeira = regra('Geladeira');
  const aluguel = regra('Aluguel');
  const luz = regra('Luz');

  describe('valorNoMes', () => {
    it('deve valer só entre o primeiro e o último mês da regra', () => {
      expect(valorNoMes(geladeira, 4)).toBe(0);
      expect(valorNoMes(geladeira, 5)).toBe(20000);
      expect(valorNoMes(geladeira, 10)).toBe(20000);
      expect(valorNoMes(geladeira, 11)).toBe(0);
    });

    it('deve usar o valor de exceção e pular o mês fora da regra', () => {
      expect(valorNoMes(aluguel, 1)).toBe(155000);
      expect(valorNoMes(aluguel, 2)).toBe(150000);
      expect(valorNoMes(luz, 2)).toBe(0);
    });
  });

  describe('projetar', () => {
    it('deve bater com as folhas de março, abril e maio do exemplo', () => {
      const sobras = projetar();

      for (const mes of MESES_DO_EXEMPLO) {
        expect(sobras[mes.numero - 1]).toBe(sobraCentavos(mes));
      }
    });

    it('deve somar o 13º em novembro e dezembro', () => {
      const sobras = projetar();

      expect(sobras[10]).toBe(538010);
      expect(sobras[11]).toBe(538010);
    });

    it('deve devolver a sobra que a geladeira tirou quando ela sai da conta', () => {
      const com = projetar();
      const sem = projetar({ sem: 'Geladeira' });

      expect(sem.map((sobra, indice) => sobra - com[indice])).toEqual([
        0, 0, 0, 0, 20000, 20000, 20000, 20000, 20000, 20000, 0, 0,
      ]);
    });

    it('deve tirar da sobra as saídas extras', () => {
      const extra = { nome: 'Compra', centavos: 1000, de: 6, ate: 6 };

      expect(projetar({ extras: [extra] })[5]).toBe(projetar()[5] - 1000);
    });

    it('deve conhecer todas as entradas do exemplo', () => {
      expect(ENTRADAS.map((entrada) => entrada.nome)).toEqual(['Salário', '13º']);
    });
  });

  describe('faixasDaRegra', () => {
    it('deve juntar os meses seguidos de mesmo valor numa faixa só', () => {
      expect(faixasDaRegra(aluguel)).toEqual([
        { de: 1, ate: 1, centavos: 155000 },
        { de: 2, ate: 12, centavos: 150000 },
      ]);
      expect(faixasDaRegra(luz)).toEqual([
        { de: 1, ate: 1, centavos: 18000 },
        { de: 3, ate: 12, centavos: 18000 },
      ]);
      expect(faixasDaRegra(geladeira)).toEqual([{ de: 5, ate: 10, centavos: 20000 }]);
    });
  });

  describe('lerCentavos', () => {
    it('deve ler o valor escrito do jeito brasileiro', () => {
      expect(lerCentavos('1.800,00')).toBe(180000);
      expect(lerCentavos('R$ 99,9')).toBe(9990);
      expect(lerCentavos('250')).toBe(25000);
    });

    it('deve devolver zero para o que não é valor e limitar o máximo', () => {
      expect(lerCentavos('')).toBe(0);
      expect(lerCentavos('abc')).toBe(0);
      expect(lerCentavos('0,00')).toBe(0);
      expect(lerCentavos('99.999.999,00')).toBe(5000000);
    });
  });

  describe('simularCompra', () => {
    it('deve cobrar a primeira parcela em junho e mostrar só de junho a dezembro', () => {
      const simulacao = simularCompra(180000, 6);

      expect(HOJE).toBe(5);
      expect(simulacao.meses.map((mes) => mes.mes)).toEqual([6, 7, 8, 9, 10, 11, 12]);
      expect(simulacao.parcela).toBe(30000);
      expect(simulacao.meses[0]).toEqual({ mes: 6, parcela: 30000, antes: 268010, depois: 238010 });
      expect(simulacao.meses[6]).toEqual({ mes: 12, parcela: 0, antes: 538010, depois: 538010 });
      expect(simulacao.paraDepois).toBe(0);
    });

    it('deve pôr o resto da divisão na primeira parcela', () => {
      const simulacao = simularCompra(100000, 3);

      expect(simulacao.meses.slice(0, 3).map((mes) => mes.parcela)).toEqual([33334, 33333, 33333]);
    });

    it('deve contar as parcelas que passam de dezembro', () => {
      expect(simularCompra(180000, 10).paraDepois).toBe(3);
      expect(simularCompra(180000, 7).paraDepois).toBe(0);
    });

    it('deve deixar a sobra como está quando não há valor', () => {
      const simulacao = simularCompra(0, 6);

      expect(simulacao.meses.every((mes) => mes.parcela === 0 && mes.antes === mes.depois)).toBe(
        true,
      );
    });

    it('deve aceitar a sobra que fica negativa', () => {
      expect(simularCompra(1000000, 1).meses[0].depois).toBe(268010 - 1000000);
    });
  });
});
