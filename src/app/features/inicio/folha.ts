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

/** Os três momentos da conta de luz na seção "A lápis e a tinta". */
export type PassoDaLuz = 'estimado' | 'chegou' | 'pago';

const SITUACAO_DA_LUZ: Record<PassoDaLuz, string> = {
  estimado: 'estimado',
  chegou: 'previsto',
  pago: 'pago',
};

/**
 * Uma folha do carnê: o canhoto âmbar com o número da folha e, ao lado, a pele de papel sobre uma
 * tabela de verdade, com os blocos "Entra" e "Sai", nenhum sinal nos valores e a sobra embaixo, em
 * tinta ou a lápis. Com `luz`, a linha da luz ganha os dois traços que a seção 4 passa a limpo.
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
  /** Só na folha da seção 4: em que ponto está a conta de luz. */
  readonly luz = input<PassoDaLuz | null>(null);

  protected readonly CONTA_CHEGOU = 'dia 15, a conta chegou';
  protected readonly SO_FALTA_A_FATURA = 'estimado: fatura do cartão final 4321 não conferida';

  /** A folha de maio aparece duas vezes na página; a da seção 4 (com `luz`) ganha outro id. */
  protected readonly idDoTitulo = computed(
    () => `titulo-folha-${this.mes().competencia}${this.luz() === null ? '' : '-a-lapis'}`,
  );
  /** Dois algarismos, como no canhoto impresso: "05". */
  protected readonly numero = computed(() => String(this.mes().numero).padStart(2, '0'));
  protected readonly entra = computed(() => this.mes().entra.map(paraEntrada));
  protected readonly sai = computed(() => this.mes().sai.map(paraSaida));
  protected readonly sobra = computed(() => emReais(sobraCentavos(this.mes())));
  protected readonly situacaoDaLuz = computed(() => SITUACAO_DA_LUZ[this.luz() ?? 'estimado']);
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
