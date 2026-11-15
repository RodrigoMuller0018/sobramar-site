// Decide antes da primeira pintura se a página pode se mexer, para nada piscar ao carregar: o CSS
// só anima sob `html[data-movimento='ligado']`. Vale a escolha guardada pela pessoa; sem escolha,
// vale o pedido do sistema. A mesma regra vive em MovimentoService, que assume quando o Angular acorda.
(function () {
  var escolha = null;
  try {
    escolha = window.localStorage.getItem('sobramar:movimento');
  } catch (erro) {
    // Sem armazenamento (modo restrito do navegador): vale só o pedido do sistema.
  }
  var sistemaPedeMenos = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ligado = escolha === 'ligado' || (escolha !== 'desligado' && !sistemaPedeMenos);
  document.documentElement.dataset.movimento = ligado ? 'ligado' : 'desligado';
})();
