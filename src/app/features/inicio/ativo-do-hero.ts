import { InjectionToken } from '@angular/core';

export interface ImagemDoHero {
  readonly url: string;
  readonly largura: number;
  readonly altura: number;
}

/**
 * O que a primeira dobra mostra. Trocar o hero é trocar os arquivos de `public/hero/` e este objeto;
 * o componente não muda. O ativo definitivo precisa do mesmo enquadramento do provisório: o objeto
 * no terço direito, com o último segundo estável e sem texto gerado dentro da imagem. Os números do
 * enquadramento (onde o objeto começa e onde fica o centro dele) estão no alto de `hero.scss`.
 */
export interface AtivoDoHero {
  /** Filme da abertura: MP4 H.264 sem som, com início rápido. Toca uma vez, só na tela larga. */
  readonly filme: string;
  /** O primeiro quadro do filme: fica na tela enquanto ele carrega. Também é pré-carregado em `src/index.html`. */
  readonly quadroInicial: string;
  /** O último quadro: é o que se vê sem movimento, sem JavaScript ou se o filme falhar. */
  readonly quadroFinal: ImagemDoHero;
  /** O mesmo objeto enquadrado em pé, para telas estreitas ou quase quadradas. */
  readonly retrato: ImagemDoHero;
  /** O segundo do filme em que a folha do mês assenta e o texto pode entrar. */
  readonly textoEntraEm: number;
  /** O que o quadro final mostra, para quem não vê a imagem. */
  readonly descricao: string;
}

/** Provisório: a abertura renderizada no Blender (visual `poente`), até o hero definitivo chegar. */
const CARNE_DO_BLENDER: AtivoDoHero = {
  filme: 'hero/carne-abertura.mp4',
  quadroInicial: 'hero/carne-inicio.webp',
  quadroFinal: { url: 'hero/carne-fim.webp', largura: 1600, altura: 900 },
  retrato: { url: 'hero/carne-retrato.webp', largura: 1080, altura: 1350 },
  textoEntraEm: 1.35,
  descricao:
    'Carnê de doze folhas aberto em leque; a folha de maio de 2027, com sobra de R$ 2.680,10, flutua acima das outras',
};

export const ATIVO_DO_HERO = new InjectionToken<AtivoDoHero>('ATIVO_DO_HERO', {
  providedIn: 'root',
  factory: () => CARNE_DO_BLENDER,
});
