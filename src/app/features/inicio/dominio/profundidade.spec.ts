import { profundidade } from './profundidade';

describe('profundidade', () => {
  it('deve deixar tudo no lugar com o ponteiro no centro', () => {
    expect(profundidade(0.5, 0.5)).toEqual({
      cena: 'scale(1.03) translate(0px, 0px)',
      texto: 'translate(0px, 0px)',
    });
  });

  it('deve levar a cena e o texto para lados opostos', () => {
    expect(profundidade(1, 1)).toEqual({
      cena: 'scale(1.03) translate(-7px, -5px)',
      texto: 'translate(3px, 2px)',
    });
    expect(profundidade(0, 0)).toEqual({
      cena: 'scale(1.03) translate(7px, 5px)',
      texto: 'translate(-3px, -2px)',
    });
  });

  it('deve arredondar para décimos de pixel', () => {
    expect(profundidade(0.83, 0.21).cena).toBe('scale(1.03) translate(-4.6px, 2.9px)');
  });

  it('deve tratar posição fora da dobra como a borda e posição inválida como o centro', () => {
    expect(profundidade(3, -2)).toEqual(profundidade(1, 0));
    expect(profundidade(Number.NaN, Number.POSITIVE_INFINITY)).toEqual(profundidade(0.5, 0.5));
  });
});
