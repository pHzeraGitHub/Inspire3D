/* ══════════════════════════════════════════════════════════════════════
   TABELA DE PREÇO DA INSPIRE 3D
   ══════════════════════════════════════════════════════════════════════

   Este é o único arquivo de política comercial do site. O motor em
   src/lib/quote.ts apenas aplica o que está aqui — não contém preço algum.

   Valores definidos pelo estúdio. Posicionamento: intermediário —
   competitivo, sem entrar barato demais.

   FÓRMULA APLICADA (por unidade):

     máquina+material = basePrice × sizeFactor
     acabamento       = MAIOR( máquina+material × (finishFactor − 1),
                               finishFloor )            ← piso de mão de obra
     unidade          = máquina+material + acabamento

     total  = máquina+material × qtd^machineExponent
            + acabamento      × qtd^laborExponent
            + modelagem (uma vez)
            tudo × urgencyFactor

   O piso existe porque em peça pequena o multiplicador sozinho não paga a
   mão de obra: 1,35× sobre R$ 39,90 rende só R$ 13,97 para lixar e tratar.
   ══════════════════════════════════════════════════════════════════════ */

export const pricing = {
  /** Com `true`, a faixa de investimento aparece na tela do cliente. */
  calibrated: true,

  currency: "BRL",

  /**
   * Peça pequena (até 8 cm), acabamento bruto, complexidade padrão.
   * É o "a partir de" que ancora todo o resto.
   */
  basePrice: {
    fdm: 39.9,
    resina: 79.9,
  },

  /** Multiplicador por faixa de tamanho. */
  sizeFactor: {
    pequeno: 1, // até 8 cm
    medio: 2.1, // 8–15 cm
    grande: 4.2, // 15–25 cm
    extra: 7.5, // acima de 25 cm
  },

  /** Multiplicador por acabamento, aplicado sobre máquina+material. */
  finishFactor: {
    bruto: 1,
    lixado: 1.35,
    pintado: 2.1,
    premium: 3.2,
  },

  /**
   * PISO DE MÃO DE OBRA por unidade, em reais.
   * O acabamento nunca é cobrado abaixo disto, por menor que seja a peça.
   */
  finishFloor: {
    bruto: 0,
    lixado: 20,
    pintado: 50,
    premium: 100,
  },

  /** Modelagem e tratamento de arquivo. Cobrado uma vez, à parte. */
  modelingPrice: {
    nenhuma: 0, // arquivo pronto para imprimir
    ajuste: 35, // ajuste simples de arquivo existente
    completa: 120, // modelagem do zero
  },

  /**
   * Referências por hora, para a proposta final quando o projeto foge do
   * "a partir de". Não entram no cálculo automático — servem de âncora na
   * conversa e aparecem na documentação do orçamento.
   */
  hourlyRate: {
    ajusteComplexo: 70,
    modelagemProjeto: 80,
  },

  /**
   * Ganho de escala, separado por natureza do custo.
   *
   * Máquina e material diluem bem em lote (0.82 ≈ −11% por unidade a cada
   * dobra de quantidade). Mão de obra manual dilui pouco: pintar 50 peças
   * é quase 50 vezes o trabalho de pintar uma. Usar o mesmo expoente para
   * os dois derrubaria o acabamento abaixo do próprio piso em pedidos
   * grandes — que é exatamente o prejuízo que o piso existe para evitar.
   */
  machineExponent: 0.82,
  laborExponent: 0.96,

  /**
   * « DEFINIR » Piso de preço por unidade, em reais, para a parte de
   * máquina+material (o acabamento tem os próprios pisos acima).
   *
   * Em 0 não há piso: um lote de 50 peças FDM pequenas brutas sai a
   * R$ 19,80 por unidade, metade do "a partir de". Isso é intencional se
   * o ganho de escala real for esse. Se não for — se abaixo de certo valor
   * a peça não paga máquina, falha e manuseio — ponha aqui o mínimo que
   * você aceita cobrar por unidade em qualquer quantidade.
   */
  minUnitPrice: 0,

  /**
   * « DEFINIR » Acréscimo para pedido urgente (fura a fila, desloca outros
   * projetos). Em 1.0 não cobra nada — nenhum valor não autorizado vai
   * parar na tela do cliente. Sugestão de mercado: 1.15 a 1.30.
   */
  urgencyFactor: 1.0,

  /**
   * Faixa exibida. O preço base é um "a partir de", então o piso da faixa
   * é o próprio valor calculado — nunca abaixo dele.
   */
  rangeSpread: { min: 1.0, max: 1.45 },

  /** Arredondamento da faixa exibida, em reais. */
  roundTo: 10,

  /**
   * Prazo em DIAS ÚTEIS, como par [mínimo, máximo]. Somados conforme o
   * projeto: base da tecnologia + acabamento + modelagem.
   */
  leadTime: {
    base: {
      fdm: [2, 4],
      resina: [3, 5],
    },
    finish: {
      bruto: [0, 0],
      lixado: [1, 2],
      pintado: [2, 4],
      premium: [4, 7],
    },
    modeling: {
      nenhuma: [0, 0],
      ajuste: [1, 2], // « CONFERIR » inferido do ajuste simples
      completa: [2, 5],
    },
    /** +1 dia no teto a cada N unidades. */
    perUnits: 12,
  },
} as const;
