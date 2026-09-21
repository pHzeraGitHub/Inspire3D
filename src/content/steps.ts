import type { Step } from "@/types";

/** Como o projeto anda, do ponto de vista de quem contrata (briefing §13). */
export const steps: Step[] = [
  {
    number: "01",
    title: "Conte sua ideia",
    description:
      "Uma descrição, um desenho, uma foto, uma referência ou um arquivo. O que você tiver em mãos já serve para começar.",
    yours: "Manda o que existe hoje, mesmo que seja só uma frase.",
  },
  {
    number: "02",
    title: "Analisamos o projeto",
    description:
      "Avaliamos dimensões, material, tecnologia e acabamento. Se o arquivo tiver problema para imprimir, você fica sabendo agora — não depois.",
    yours: "Você recebe a proposta com o que foi decidido e por quê.",
  },
  {
    number: "03",
    title: "Produzimos",
    description:
      "Seu projeto entra em fabricação. Quando há modelagem, você aprova o render antes de qualquer máquina ligar.",
    yours: "Nenhuma peça entra em produção sem o seu aceite.",
  },
  {
    number: "04",
    title: "Finalizamos",
    description:
      "Remoção de suporte, lixamento, pintura, montagem e inspeção. É aqui que a peça deixa de parecer protótipo.",
    yours: "Nada sai da bancada sem passar por inspeção.",
  },
  {
    number: "05",
    title: "Você recebe",
    description:
      "A peça sai da bancada embalada, pronta para usar ou presentear.",
    yours: "O arquivo fica guardado para a próxima peça igual.",
  },
];
