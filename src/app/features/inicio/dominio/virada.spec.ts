import { estadoDasFolhas, folhaAtiva, progressoDaFolha } from './virada';

const DEITADA = { angulo: 0, opacidade: 1 };

describe('a virada das folhas pela rolagem', () => {
  it('deve começar com todas as folhas deitadas e visíveis', () => {
    expect(estadoDasFolhas(0, 3)).toEqual([DEITADA, DEITADA, DEITADA]);
  });

  it('deve segurar a folha parada no começo do trecho, para dar tempo de ler', () => {
    expect(estadoDasFolhas(0.05, 3)[0]).toEqual(DEITADA);
  });

  it('deve girar a folha sem apagá-la até pouco depois da metade do giro', () => {
    expect(estadoDasFolhas(0.25, 3)[0]).toEqual({ angulo: -44, opacidade: 1 });
  });

  it('deve virar e sumir com a primeira folha na metade do caminho, sem mexer nas outras', () => {
    expect(estadoDasFolhas(0.5, 3)).toEqual([{ angulo: -88, opacidade: 0 }, DEITADA, DEITADA]);
  });

  it('deve manter a última folha sempre deitada', () => {
    expect(estadoDasFolhas(1, 3)).toEqual([
      { angulo: -88, opacidade: 0 },
      { angulo: -88, opacidade: 0 },
      DEITADA,
    ]);
  });

  it('deve limitar o progresso entre 0 e 1', () => {
    expect(estadoDasFolhas(-1, 3)).toEqual(estadoDasFolhas(0, 3));
    expect(estadoDasFolhas(2, 3)).toEqual(estadoDasFolhas(1, 3));
  });

  it('deve dizer qual folha está por cima', () => {
    expect([0, 0.2, 0.3, 0.5, 0.8, 1].map((progresso) => folhaAtiva(progresso, 3))).toEqual([
      0, 0, 1, 1, 2, 2,
    ]);
  });

  it('deve dizer em que ponto da rolagem cada folha repousa por cima', () => {
    expect([0, 1, 2].map((indice) => progressoDaFolha(indice, 3))).toEqual([0, 0.5, 1]);
  });

  it('deve funcionar com uma folha só', () => {
    expect(estadoDasFolhas(0.7, 1)).toEqual([DEITADA]);
    expect(folhaAtiva(0.7, 1)).toBe(0);
    expect(progressoDaFolha(0, 1)).toBe(0);
  });
});
