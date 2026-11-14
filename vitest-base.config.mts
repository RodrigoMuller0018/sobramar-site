import { defineConfig } from 'vitest/config';

// Lido pelo `@angular/build:unit-test` (`runnerConfig` no angular.json). O primeiro `axe.run` de
// cada arquivo leva perto de 1 s na máquina local; no runner da CI, com dois núcleos e cobertura,
// passou dos 5 s padrão do Vitest. 15 s dá folga sem esconder um teste que trave de verdade.
export default defineConfig({
  test: {
    testTimeout: 15000,
  },
});
