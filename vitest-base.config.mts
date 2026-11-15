import { defineConfig } from 'vitest/config';

// Lido pelo `@angular/build:unit-test` (`runnerConfig` no angular.json). Sem isolamento, arquivos de
// teste que caem no mesmo worker dividem o mesmo jsdom: depois dos relógios falsos do hero, o
// `setTimeout` global voltava falso no arquivo seguinte, e o axe-core, que fecha cada regra com um
// `setTimeout`, esperava para sempre. Na máquina local havia workers sobrando e nada se cruzava; no
// runner da CI, com dois núcleos, travava. Cada arquivo com o seu ambiente custa uns segundos e
// tira essa dependência da ordem.
export default defineConfig({
  test: {
    isolate: true,
  },
});
