import { ESTENDER, roteiroDaRegua } from './roteiro-da-regua';

describe('o roteiro da régua', () => {
  it('deve riscar as faixas uma depois da outra e começar a geladeira antes da última acabar', () => {
    expect(roteiroDaRegua(3, 4, 1)).toEqual({
      faixas: [0, 50, 100],
      geladeira: 400,
      trocas: [{ mes: 4, em: 586 }],
      fim: 1800,
    });
  });

  it('deve trocar a sobra de cada mês quando a ponta da faixa passa por ele', () => {
    const { trocas, geladeira, fim } = roteiroDaRegua(0, 4, 6);
    const momentos = trocas.map((troca) => troca.em);
    const intervalos = momentos.slice(1).map((momento, indice) => momento - momentos[indice]);

    expect(geladeira).toBe(0);
    expect(trocas.map((troca) => troca.mes)).toEqual([4, 5, 6, 7, 8, 9]);
    expect(momentos[0]).toBeLessThan(50);
    expect(momentos.at(-1)).toBeLessThan(ESTENDER);
    // A faixa desacelera no fim, então os meses do fim trocam mais espaçados.
    expect(intervalos).toEqual([...intervalos].sort((a, b) => a - b));
    expect(fim).toBe(1400);
  });

  it('deve não ter faixas comuns quando só a geladeira se repete', () => {
    expect(roteiroDaRegua(0, 4, 6).faixas).toEqual([]);
  });
});
