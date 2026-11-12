import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LINKS_DO_APP } from '../../core/config/urls';

/** A barra fixa: a marca, o caminho para as folhas, o login do app e a ação principal. */
@Component({
  selector: 'header[app-topo]',
  templateUrl: './topo.html',
  styleUrl: './topo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'nav' },
})
export class Topo {
  protected readonly links = inject(LINKS_DO_APP);
}
