import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Seção 6: o que o app guarda e o que ele nunca pede. Só tipografia, em duas colunas com fios;
 * nenhum cartão, nenhum ícone, nenhum movimento.
 */
@Component({
  selector: 'section[app-confianca]',
  templateUrl: './confianca.html',
  styleUrl: './confianca.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { id: 'confianca', class: 'section', 'aria-labelledby': 'titulo-confianca' },
})
export class Confianca {}
