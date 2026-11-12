import { InjectionToken, inject } from '@angular/core';

/**
 * Onde o app vive. O site só aponta para ele: cadastro, login e textos legais são do app.
 * Em desenvolvimento é o servidor local do sobramar-frontend; o endereço de produção entra aqui
 * quando o domínio do app for definido.
 */
export const URL_DO_APP = new InjectionToken<string>('URL_DO_APP', {
  providedIn: 'root',
  factory: () => 'http://localhost:4200',
});

export interface LinksDoApp {
  readonly comecar: string;
  readonly entrar: string;
  readonly privacidade: string;
  readonly termos: string;
}

export const LINKS_DO_APP = new InjectionToken<LinksDoApp>('LINKS_DO_APP', {
  providedIn: 'root',
  factory: () => {
    const base = inject(URL_DO_APP);
    return {
      comecar: `${base}/comecar`,
      entrar: `${base}/entrar`,
      privacidade: `${base}/privacidade`,
      termos: `${base}/termos`,
    };
  },
});
