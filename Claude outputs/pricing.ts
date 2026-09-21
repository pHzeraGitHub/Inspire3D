/* ══════════════════════════════════════════════════════════════════════
   TABELA DE PREÇO DA INSPIRE 3D
   ══════════════════════════════════════════════════════════════════════

   ESTE É O ÚNICO ARQUIVO QUE VOCÊ PRECISA EDITAR PARA LIGAR OS PREÇOS.

   Enquanto `calibrated` for `false`, o site NÃO mostra valor nenhum ao
   cliente — mostra prazo, tecnologia recomendada, complexidade e o briefing
   técnico. Nada de número inventado na tela.

   Para ligar:
     1. troque os valores marcados com « PREENCHER » pelos seus números reais;
     2. mude `calibrated` para `true`;
     3. pronto — a faixa de investimento passa a aparecer na tela de resultado.
   ══════════════════════════════════════════════════════════════════════ */

export const pricing = {
  /** Vire para `true` só quando os números abaixo forem os seus de verdade. */
  calibrated: false,

  currency: "BRL",

  /**
   * Preço de referência de UMA peça pequena (até ~8 cm), acabamento bruto,
   * já incluindo material, máquina e manuseio. É a base de todo o cálculo.
   * « PREENCHER » com o que você cobraria hoje por essa peça.
   */
  basePrice: {
    fdm: 90, // « PREENCHER »
    resina: 145, // « PREENCHER »
  },

  /**
   * Multiplicador por faixa de tamanho, sobre o preço base.
   * A peça grande consome mais material e muito mais tempo de máquina.
   */
  sizeFactor: {
    pequeno: 1, // até 8 cm
    medio: 2.1, // 8–15 cm      « CONFERIR »
    grande: 4.2, // 15–25 cm     « CONFERIR »
    extra: 7.5, // acima de 25 cm « CONFERIR »
  },

  /**
   * Multiplicador por acabamento. `bruto` é a peça como sai da máquina,
   * só com suportes removidos.
   */
  finishFactor: {
    bruto: 1,
    lixado: 1.35, // « CONFERIR »
    pintado: 2.1, // « CONFERIR »
    premium: 3.2, // « CONFERIR » pintura detalhada, base, montagem
  },

  /**
   * Modelagem digital, quando o cliente não tem arquivo.
   * Cobrada à parte, somada ao total.
   */
  modelingPrice: {
    nenhuma: 0, // cliente enviou arquivo pronto
    ajuste: 120, // « PREENCHER » reparo/adequação de arquivo existente
    completa: 480, // « PREENCHER » modelagem do zero
  },

  /**
   * Ganho de escala. 0.82 significa: dobrar a quantidade multiplica o
   * total por ~1.77, não por 2 — ou seja, ~11% de desconto por unidade a
   * cada dobra. Quanto MENOR o número, MAIOR o desconto por volume.
   * « CONFERIR » com a sua realidade de produção.
   */
  quantityExponent: 0.82,

  /** Largura da faixa exibida: de -18% a +32% sobre o valor central. */
  rangeSpread: { min: 0.82, max: 1.32 },

  /** Arredondamento da faixa exibida, para não mostrar R$ 337. */
  roundTo: 10,

  /** Prazo em dias úteis. Somado conforme o projeto. */
  leadTime: {
    baseFdm: 3, // « CONFERIR »
    baseResina: 4, // « CONFERIR »
    finish: { bruto: 0, lixado: 2, pintado: 5, premium: 9 }, // « CONFERIR »
    modeling: { nenhuma: 0, ajuste: 2, completa: 7 }, // « CONFERIR »
    /** Dias extras a cada N unidades. */
    perUnits: 12,
    /** Folga somada ao limite superior do prazo. */
    buffer: 4,
  },
} as const;

export type SizeBand = keyof typeof pricing.sizeFactor;
export type ModelingLevel = keyof typeof pricing.modelingPrice;
