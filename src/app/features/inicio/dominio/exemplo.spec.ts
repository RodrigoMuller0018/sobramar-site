import { MESES_DO_EXEMPLO, emReais, saidasCentavos, sobraCentavos } from './exemplo';

describe('a casa do exemplo', () => {
  it('deve trazer março, abril e maio de 2027, em ordem', () => {
    expect(MESES_DO_EXEMPLO.map((mes) => mes.competencia)).toEqual([
      '2027-03',
      '2027-04',
      '2027-05',
    ]);
    expect(MESES_DO_EXEMPLO.map((mes) => mes.numero)).toEqual([3, 4, 5]);
  });

  // Os mesmos centavos de docs/exemplo-de-referencia.md, no backend.
  it.each([
    ['2027-03', 331990, 168010],
    ['2027-04', 211990, 288010],
    ['2027-05', 231990, 268010],
  ])('deve bater com o exemplo de referência em %s', (competencia, saidas, sobra) => {
    const mes = MESES_DO_EXEMPLO.find((candidato) => candidato.competencia === competencia);

    expect(mes).toBeDefined();
    expect(saidasCentavos(mes!)).toBe(saidas);
    expect(sobraCentavos(mes!)).toBe(sobra);
  });

  it('deve deixar só maio a lápis, dizendo o que falta', () => {
    const [marco, abril, maio] = MESES_DO_EXEMPLO;

    expect(marco.confianca).toBe('firme');
    expect(abril.confianca).toBe('firme');
    expect(maio.confianca).toBe('estimada');
    expect(maio.estado).toContain('Luz ainda sem valor certo');
  });

  it('deve escrever o motivo em todo valor estimado', () => {
    const estimados = MESES_DO_EXEMPLO.flatMap((mes) => mes.sai).filter(
      (lancamento) => lancamento.situacao === 'estimado',
    );

    expect(estimados).toHaveLength(1);
    expect(estimados[0].detalhe).toContain('estimado, a conta chega');
  });

  it('deve identificar o cartão pelos quatro últimos dígitos', () => {
    const detalhes = MESES_DO_EXEMPLO.flatMap((mes) => mes.sai).map(
      (lancamento) => lancamento.detalhe,
    );

    expect(detalhes.some((detalhe) => detalhe.includes('cartão final 4321'))).toBe(true);
  });
});

describe('emReais', () => {
  it.each([
    [268010, 'R$ 2.680,10'],
    [5, 'R$ 0,05'],
    [120000, 'R$ 1.200,00'],
    [100000000, 'R$ 1.000.000,00'],
  ])('deve formatar %i centavos como %s', (centavos, esperado) => {
    expect(emReais(centavos)).toBe(esperado);
  });
});
