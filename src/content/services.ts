import type { Service } from "@/types";

/**
 * As seis frentes do estúdio, vistas como CAPACIDADE.
 *
 * Diferente de `verticals.ts`, que corta por categoria de produto (o que sai
 * da bancada). Aqui o corte é por trabalho: o que o estúdio faz e o que o
 * cliente recebe no fim. As duas leituras se cruzam de propósito.
 */
export const services: Service[] = [
  {
    number: "01",
    slug: "impressao-3d",
    title: "Impressão 3D sob demanda",
    lead: "Você manda o arquivo, a gente estuda como fabricar. FDM para peça grande e funcional, resina quando o detalhe precisa aparecer.",
    includes: [
      "Análise do arquivo antes de imprimir: espessura de parede, malha fechada, escala real",
      "Escolha de material e parâmetro por geometria, não por padrão de fábrica",
      "Orientação de peça e estratégia de suporte para reduzir marca e falha",
      "Remoção de suporte e inspeção peça a peça",
    ],
    delivers: "A peça impressa, conferida, com relatório do que foi ajustado no arquivo.",
  },
  {
    number: "02",
    slug: "modelagem",
    title: "Modelagem digital",
    lead: "Não tem arquivo 3D? Começamos pela sua ideia. Foto, rascunho no papel, referência ou só a descrição escrita.",
    includes: [
      "Modelagem do zero ou a partir de referência visual",
      "Reparo e adequação de arquivo que existe mas não imprime",
      "Ajuste de escala, tolerância e encaixe para a peça funcionar montada",
      "Separação em partes quando a peça não cabe inteira na mesa",
    ],
    delivers: "Render para você aprovar antes de qualquer impressão, e o arquivo pronto para produzir.",
  },
  {
    number: "03",
    slug: "acabamento",
    title: "Pintura & acabamento",
    lead: "É a etapa que separa peça impressa de produto. Sem ela, a melhor impressão continua parecendo protótipo.",
    includes: [
      "Lixamento e tratamento de superfície até sumir a linha de camada",
      "Primer, pintura à mão e aerografia",
      "Lavagem e pós-cura controlada nas peças de resina",
      "Montagem, colagem e base de exposição",
    ],
    delivers: "A peça com a aparência que você imaginou, embalada para entregar ou presentear.",
  },
  {
    number: "04",
    slug: "personalizacao",
    title: "Personalização",
    lead: "Nome, data, logo, rosto. A mesma peça que existe para todo mundo, feita para uma pessoa só.",
    includes: [
      "Gravação de nome, data e mensagem na própria geometria",
      "Aplicação de marca em brinde e peça corporativa",
      "Retrato em miniatura a partir de fotos",
      "Variações de uma mesma peça para grupos, equipes e eventos",
    ],
    delivers: "Peça única, ou um lote em que cada unidade sai diferente da outra.",
  },
  {
    number: "05",
    slug: "prototipagem",
    title: "Prototipagem & peças funcionais",
    lead: "Da ideia ao teste físico em dias. E da peça quebrada à substituta sob medida, quando ninguém mais fabrica.",
    includes: [
      "Protótipo de produto para validar forma, encaixe e ergonomia",
      "Peça de reposição a partir da peça original ou de medidas",
      "Gabarito, suporte técnico e dispositivo de bancada",
      "Iteração rápida: ajusta, imprime de novo, testa",
    ],
    delivers: "A peça na mão para testar de verdade, e o arquivo para repetir quando precisar.",
  },
  {
    number: "06",
    slug: "desenvolvimento",
    title: "Desenvolvimento de produto",
    lead: "Quando a ideia ainda não existe como objeto. Vale para jogo de tabuleiro, linha de produto ou projeto autoral.",
    includes: [
      "Estudo de viabilidade de fabricação antes de investir em série",
      "Desenvolvimento de componente para jogo: dados, peões, tokens, insertos",
      "Definição de material, processo e custo por unidade em escala",
      "Série piloto para testar mercado antes da produção cheia",
    ],
    delivers: "Um produto que fabrica, com custo conhecido e arquivo pronto para repetir.",
  },
];
