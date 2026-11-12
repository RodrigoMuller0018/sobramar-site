import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Fecho } from './features/inicio/fecho';
import { Folhas } from './features/inicio/folhas';
import { Hero } from './features/inicio/hero';
import { Topo } from './features/inicio/topo';

/** A página inteira: barra fixa, a primeira dobra, as folhas e o fecho. Uma seção por tela. */
@Component({
  selector: 'app-root',
  imports: [Fecho, Folhas, Hero, Topo],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
