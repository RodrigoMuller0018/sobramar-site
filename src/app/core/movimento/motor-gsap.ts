import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { CenaDeRolagem, OpcoesDaCena } from './cena-de-rolagem';

/** Segundos que a animação leva para alcançar a rolagem: tira o degrau da roda do mouse. */
const ATRASO_DO_SCRUB = 0.6;
const MILISSEGUNDOS = 1000;

/**
 * Liga a rolagem da página (Lenis) ao progresso de uma seção (ScrollTrigger). O único arquivo do
 * site que conhece as duas bibliotecas; só é carregado no navegador, por `CRIAR_CENA`.
 * A seção não é "pinada" pelo GSAP: ela tem duas telas de altura e o conteúdo fica preso por
 * `position: sticky`, então o progresso é só a rolagem dentro dela.
 */
export function criarCena({ secao, aoProgredir, aoChegar }: OpcoesDaCena): CenaDeRolagem {
  gsap.registerPlugin(ScrollTrigger);

  const rolagem = new Lenis({ anchors: true });
  const quadro = (segundos: number) => rolagem.raf(segundos * MILISSEGUNDOS);
  const pararRolagem = () => {
    gsap.ticker.remove(quadro);
    rolagem.destroy();
  };
  rolagem.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(quadro);
  gsap.ticker.lagSmoothing(0);

  const estado = { progresso: 0 };
  const chegada = { progresso: 0 };
  let animacao: gsap.core.Tween;
  let aproximacao: gsap.core.Tween | null = null;
  try {
    if (aoChegar) {
      aproximacao = gsap.to(chegada, {
        progresso: 1,
        ease: 'none',
        onUpdate: () => aoChegar(chegada.progresso),
        scrollTrigger: {
          trigger: secao,
          start: 'top bottom',
          end: 'top top',
          scrub: ATRASO_DO_SCRUB,
        },
      });
    }
    animacao = gsap.to(estado, {
      progresso: 1,
      ease: 'none',
      onUpdate: () => aoProgredir(estado.progresso),
      scrollTrigger: {
        trigger: secao,
        start: 'top top',
        end: 'bottom bottom',
        scrub: ATRASO_DO_SCRUB,
      },
    });
  } catch (erro) {
    // Sem a animação, a rolagem suave não pode ficar ligada sozinha.
    aproximacao?.scrollTrigger?.kill();
    aproximacao?.kill();
    pararRolagem();
    throw erro;
  }

  return {
    irPara(progresso) {
      const gatilho = animacao.scrollTrigger;
      if (gatilho) {
        rolagem.scrollTo(gatilho.start + (gatilho.end - gatilho.start) * progresso);
      }
    },
    destruir() {
      aproximacao?.scrollTrigger?.kill();
      aproximacao?.kill();
      animacao.scrollTrigger?.kill();
      animacao.kill();
      pararRolagem();
    },
  };
}
