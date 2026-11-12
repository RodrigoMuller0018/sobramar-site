import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LINKS_DO_APP } from '../../core/config/urls';

/** A primeira dobra: o que é, para quem, um fato do exemplo e a foto do carnê. Nada se mexe aqui. */
@Component({
  selector: 'section[app-hero]',
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hero', 'aria-labelledby': 'titulo-hero' },
})
export class Hero {
  protected readonly links = inject(LINKS_DO_APP);
}
