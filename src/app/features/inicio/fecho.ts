import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LINKS_DO_APP } from '../../core/config/urls';

/** A última tela: o convite para montar o carnê e, embaixo, os links e a linha legal. */
@Component({
  selector: 'footer[app-fecho]',
  templateUrl: './fecho.html',
  styleUrl: './fecho.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'closing' },
})
export class Fecho {
  protected readonly links = inject(LINKS_DO_APP);
}
