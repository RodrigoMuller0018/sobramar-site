import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TrocaAnimada } from '../../core/movimento/troca-animada';
import { emReais } from './dominio/exemplo';
import { lerCentavos, simularCompra } from './dominio/projecao';

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/**
 * Seção 5: antes de comprar, veja o depois. Uma compra no cartão, com valor e parcelas, muda a
 * sobra de junho a dezembro da casa do exemplo. Sem login, sem botão de calcular: a tabela
 * responde enquanto a pessoa digita ou arrasta. Nada vai para a rede nem fica guardado.
 */
@Component({
  selector: 'section[app-simulador]',
  imports: [TrocaAnimada],
  templateUrl: './simulador.html',
  styleUrl: './simulador.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { id: 'antes', class: 'section', 'aria-labelledby': 'titulo-simulador' },
})
export class Simulador {
  /** O ponto de partida: R$ 1.800,00 em 6 vezes. */
  protected readonly valor = signal('1.800,00');
  protected readonly vezes = signal(6);

  private readonly total = computed(() => lerCentavos(this.valor()));
  private readonly simulacao = computed(() => simularCompra(this.total(), this.vezes()));

  protected readonly linhas = computed(() =>
    this.simulacao().meses.map((mes) => ({
      ...mes,
      nome: MESES[mes.mes - 1],
      parcelaEscrita: mes.parcela ? emReais(mes.parcela) : 'sem parcela',
      antesEscrito: emReais(mes.antes),
      depoisEscrito: mes.depois < 0 ? `faltam ${emReais(-mes.depois)}` : emReais(mes.depois),
    })),
  );

  protected readonly resumo = computed(() => {
    const total = this.total();
    const vezes = this.vezes();
    const { parcela, meses, paraDepois } = this.simulacao();
    if (!total) {
      return 'Digite um valor para ver a diferença.';
    }
    const [junho] = meses;
    const queda = `de ${emReais(junho.antes)} para ${emReais(junho.depois)}`;
    const compra =
      vezes === 1
        ? `À vista no cartão: a sobra de junho cai ${emReais(total)}, ${queda}.`
        : `${vezes} parcelas de ${emReais(parcela)}, a partir de junho. Em junho a sobra cai ${queda}.`;
    const depois =
      paraDepois > 0
        ? ` ${paraDepois} ${paraDepois === 1 ? 'parcela fica' : 'parcelas ficam'} para 2028, fora deste carnê.`
        : '';
    return compra + depois;
  });
}
