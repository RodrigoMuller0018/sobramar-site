import { chegadaDaPilha, estadoDasFolhas, folhaAtiva, progressoDaFolha } from './virada';

/** A folha de cima, de frente e nítida. */
const DE_FRENTE = {
  angulo: 0,
  opacidade: 1,
  profundidade: 0,
  transform: 'translate3d(0px, 0px, 0px) rotate(0deg) rotateY(0deg)',
  filtro: 'brightness(1) blur(0px)',
};
/** Uma folha por cima: um nível para trás, girada 5°, 20 % mais escura e fora de foco. */
const UM_NIVEL = {
  angulo: 0,
  opacidade: 1,
  profundidade: 1,
  transform: 'translate3d(26px, 16px, -70px) rotate(5deg) rotateY(0deg)',
  filtro: 'brightness(0.8) blur(1.2px)',
};
const DOIS_NIVEIS = {
  angulo: 0,
  opacidade: 1,
  profundidade: 2,
  transform: 'translate3d(52px, 32px, -140px) rotate(10deg) rotateY(0deg)',
  filtro: 'brightness(0.7) blur(2.4px)',
};

describe('a virada das folhas pela rolagem', () => {
  it('deve começar com a primeira folha de frente e as outras em leque por baixo', () => {
    expect(estadoDasFolhas(0, 3)).toEqual([DE_FRENTE, UM_NIVEL, DOIS_NIVEIS]);
  });

  it('deve segurar a folha parada no começo do trecho, para dar tempo de ler', () => {
    expect(estadoDasFolhas(0.05, 3)).toEqual(estadoDasFolhas(0, 3));
  });

  it('deve girar a folha de cima enquanto a de baixo sobe meio nível', () => {
    const [cima, meio, fundo] = estadoDasFolhas(0.25, 3);

    expect(cima.angulo).toBe(-44);
    expect(cima.opacidade).toBe(1);
    expect(cima.filtro).toBe('brightness(0.93) blur(0px)');
    expect(meio.transform).toBe('translate3d(13px, 8px, -35px) rotate(2.5deg) rotateY(0deg)');
    expect(meio.filtro).toBe('brightness(0.9) blur(0.6px)');
    expect(fundo.profundidade).toBe(1.5);
  });

  it('deve manter a folha opaca até ela estar quase de perfil', () => {
    for (let progresso = 0; progresso <= 0.5; progresso += 0.01) {
      const [cima] = estadoDasFolhas(progresso, 3);
      if (cima.angulo > -77) {
        expect(cima.opacidade).toBe(1);
      }
    }
  });

  it('deve virar e sumir com a primeira folha na metade do caminho, com a segunda já de frente', () => {
    const [cima, meio, fundo] = estadoDasFolhas(0.5, 3);

    expect(cima).toMatchObject({ angulo: -88, opacidade: 0, filtro: 'brightness(0.86) blur(0px)' });
    expect(meio).toEqual(DE_FRENTE);
    expect(fundo).toEqual(UM_NIVEL);
  });

  it('deve manter a última folha sempre sem girar', () => {
    const estados = estadoDasFolhas(1, 3);

    expect(estados.slice(0, 2).map((folha) => folha.opacidade)).toEqual([0, 0]);
    expect(estados[2]).toEqual(DE_FRENTE);
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
    expect(estadoDasFolhas(0.7, 1)).toEqual([DE_FRENTE]);
    expect(folhaAtiva(0.7, 1)).toBe(0);
    expect(progressoDaFolha(0, 1)).toBe(0);
  });

  it('deve trazer a pilha deitada e menor até ela ficar de frente', () => {
    expect(chegadaDaPilha(0)).toBe(
      'perspective(1600px) translateY(70px) rotateX(24deg) scale(0.9)',
    );
    expect(chegadaDaPilha(0.5)).toBe(
      'perspective(1600px) translateY(35px) rotateX(12deg) scale(0.95)',
    );
    expect(chegadaDaPilha(1)).toBe('perspective(1600px) translateY(0px) rotateX(0deg) scale(1)');
    expect(chegadaDaPilha(3)).toBe(chegadaDaPilha(1));
  });
});
