type Ouvinte = (evento: { matches: boolean }) => void;

/**
 * O jsdom não tem `matchMedia`. Isto põe um no lugar, respondendo às consultas listadas (as demais
 * dão falso), e devolve um jeito de mudar a resposta depois, como faria uma troca de tamanho de tela.
 */
export function simularMidia(respostas: Record<string, boolean>) {
  const ouvintes = new Map<string, Ouvinte[]>();
  window.matchMedia = ((consulta: string) => ({
    get matches() {
      return respostas[consulta] ?? false;
    },
    addEventListener: (_tipo: string, ouvinte: Ouvinte) =>
      ouvintes.set(consulta, [...(ouvintes.get(consulta) ?? []), ouvinte]),
    removeEventListener: (_tipo: string, ouvinte: Ouvinte) =>
      ouvintes.set(
        consulta,
        (ouvintes.get(consulta) ?? []).filter((atual) => atual !== ouvinte),
      ),
  })) as unknown as typeof window.matchMedia;

  return {
    mudar(consulta: string, matches: boolean): void {
      respostas[consulta] = matches;
      (ouvintes.get(consulta) ?? []).forEach((ouvinte) => ouvinte({ matches }));
    },
  };
}

export function removerMidia(): void {
  Reflect.deleteProperty(window, 'matchMedia');
}

/** Apaga a escolha de movimento que um teste deixou no navegador de mentira. */
export function limparMovimento(): void {
  localStorage.clear();
  Reflect.deleteProperty(document.documentElement.dataset, 'movimento');
}

export const MENOS_MOVIMENTO = '(prefers-reduced-motion: reduce)';
export const CABE_A_CENA = '(min-width: 900px) and (min-height: 660px)';
/** O arranjo largo da primeira dobra: o filme cobre a tela e o texto fica à esquerda do carnê. */
export const DOBRA_LARGA = '(min-width: 1240px) and (min-aspect-ratio: 3/2)';
