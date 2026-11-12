import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Lancamento, MesDoExemplo, emReais, sobraCentavos } from './dominio/exemplo';

interface Linha {
  readonly descricao: string;
  readonly detalhe: string;
  readonly valor: string;
  readonly situacao: string;
  readonly carimbada: boolean;
  readonly estimada: boolean;
}

/**
 * Uma folha do carnê: a pele de papel sobre uma tabela de verdade, com os blocos "Entra" e "Sai",
 * nenhum sinal nos valores e a sobra embaixo, em tinta ou a lápis.
 */
@Component({
  selector: 'article[app-folha]',
  templateUrl: './folha.html',
  styleUrl: './folha.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'folha',
    '[class.folha--a-lapis]': 'mes().confianca === "estimada"',
    '[attr.aria-labelledby]': 'idDoTitulo()',
  },
})
export class Folha {
  readonly mes = input.required<MesDoExemplo>();

  protected readonly idDoTitulo = computed(() => `titulo-folha-${this.mes().competencia}`);
  protected readonly entra = computed(() => this.mes().entra.map(paraEntrada));
  protected readonly sai = computed(() => this.mes().sai.map(paraSaida));
  protected readonly sobra = computed(() => emReais(sobraCentavos(this.mes())));
}

function paraEntrada(lancamento: Lancamento): Linha {
  return {
    descricao: lancamento.descricao,
    detalhe: lancamento.detalhe,
    valor: emReais(lancamento.centavos),
    situacao: lancamento.situacao === 'pago' ? 'recebido' : 'previsto',
    carimbada: false,
    estimada: false,
  };
}

function paraSaida(lancamento: Lancamento): Linha {
  return {
    descricao: lancamento.descricao,
    detalhe: lancamento.detalhe,
    valor: emReais(lancamento.centavos),
    situacao: lancamento.situacao,
    carimbada: lancamento.situacao === 'pago',
    estimada: lancamento.situacao === 'estimado',
  };
}
