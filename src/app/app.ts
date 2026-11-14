import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Confianca } from './features/inicio/confianca';
import { Fecho } from './features/inicio/fecho';
import { Folhas } from './features/inicio/folhas';
import { Hero } from './features/inicio/hero';
import { Lapis } from './features/inicio/lapis';
import { Regua } from './features/inicio/regua';
import { Simulador } from './features/inicio/simulador';
import { Topo } from './features/inicio/topo';

/**
 * A página inteira: barra fixa, a primeira dobra, as folhas, a régua do ano, o lápis e a tinta, o
 * simulador, o que o app guarda e o fecho. Uma ideia por tela.
 */
@Component({
  selector: 'app-root',
  imports: [Confianca, Fecho, Folhas, Hero, Lapis, Regua, Simulador, Topo],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
