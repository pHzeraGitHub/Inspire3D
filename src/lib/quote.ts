import { pricing } from "@/config/pricing";
import type {
  QuoteComplexity,
  QuoteEstimate,
  QuoteRequest,
  QuoteTechnology,
} from "@/types";

/**
 * Motor de estimativa da Inspire 3D.
 *
 * Regra que sustenta tudo: o cliente nunca vê número inventado.
 * Enquanto `pricing.calibrated` for false, `price` volta `null` e a interface
 * mostra apenas prazo, complexidade, tecnologia recomendada e o briefing.
 *
 * Toda a política comercial vive em `src/config/pricing.ts`. Este arquivo só
 * aplica as regras — não contém preço algum.
 */

/** Recomenda a tecnologia quando o cliente não sabe qual quer. */
export function recommendTechnology(
  input: Pick<QuoteRequest, "technology" | "size" | "category" | "finish">,
): { technology: Exclude<QuoteTechnology, "indefinido">; reason: string } {
  if (input.technology === "fdm" || input.technology === "resina") {
    return {
      technology: input.technology,
      reason: "Tecnologia escolhida por você. Se fizer mais sentido pelo outro caminho, avisamos na análise.",
    };
  }

  const detailCategories = ["miniatura", "colecionavel", "personagem", "jogos"];
  const wantsDetail = detailCategories.includes(input.category);
  const isBig = input.size === "grande" || input.size === "extra";
  const wantsPaint = input.finish === "pintado" || input.finish === "premium";

  if (isBig && !wantsDetail) {
    return {
      technology: "fdm",
      reason: "Peça grande e funcional: FDM entrega volume com resistência e custo menor.",
    };
  }
  if (wantsDetail || wantsPaint) {
    return {
      technology: "resina",
      reason: "Detalhe fino e superfície limpa são o forte da resina — é o que a pintura precisa embaixo.",
    };
  }
  return {
    technology: "fdm",
    reason: "Pelo que você descreveu, FDM resolve com bom custo. Confirmamos na análise técnica.",
  };
}

function assessComplexity(input: Partial<QuoteRequest>): QuoteComplexity {
  let score = 0;
  if (input.size === "grande") score += 1;
  if (input.size === "extra") score += 2;
  if (input.finish === "pintado") score += 1;
  if (input.finish === "premium") score += 2;
  if (input.modeling === "ajuste") score += 1;
  if (input.modeling === "completa") score += 2;
  if ((input.quantity ?? 1) > 20) score += 1;
  if (input.deadline === "urgente") score += 1;

  if (score <= 1) return "simples";
  if (score <= 4) return "media";
  return "alta";
}

/**
 * Sanitização de entrada.
 *
 * A rota /api/quote já valida tudo antes de chegar aqui, mas este motor é
 * exportado e vai ser reusado (a Inspire AI chama ele na Fase 4). Um valor
 * fora da lista não pode virar `undefined` num multiplicador e transformar a
 * estimativa inteira em NaN — então cada campo cai num padrão explícito.
 */
const pick = <T extends string>(table: Record<T, unknown>, value: unknown, fallback: T): T =>
  typeof value === "string" && value in table ? (value as T) : fallback;

const safeQuantity = (value: unknown): number => {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(n, 1), 10_000);
};

export function estimateQuote(input: Partial<QuoteRequest>): QuoteEstimate {
  const size = pick(pricing.sizeFactor, input.size, "pequeno");
  const finish = pick(pricing.finishFactor, input.finish, "bruto");
  const modeling = pick(pricing.modelingPrice, input.modeling, "nenhuma");
  const quantity = safeQuantity(input.quantity);

  const { technology, reason } = recommendTechnology({
    technology:
      input.technology === "fdm" || input.technology === "resina"
        ? input.technology
        : "indefinido",
    size,
    category: typeof input.category === "string" ? input.category : "",
    finish,
  });

  /* ── Prazo ─────────────────────────────────────────────────────────
     Somatório de faixas [mín, máx]: base da tecnologia + acabamento +
     modelagem, com folga no teto conforme a quantidade.                */
  const legs = [
    pricing.leadTime.base[technology],
    pricing.leadTime.finish[finish],
    pricing.leadTime.modeling[modeling],
  ];
  const floorDays = legs.reduce((sum, [lo]) => sum + lo, 0);
  const ceilingDays =
    legs.reduce((sum, [, hi]) => sum + hi, 0) +
    (quantity > pricing.leadTime.perUnits
      ? Math.floor(quantity / pricing.leadTime.perUnits)
      : 0);

  /* ── Preço ─────────────────────────────────────────────────────────
     Máquina e mão de obra escalam de formas diferentes — ver a nota em
     config/pricing.ts sobre machineExponent e laborExponent.           */
  let price: QuoteEstimate["price"] = null;
  let floorApplied = false;

  if (pricing.calibrated) {
    const machine = pricing.basePrice[technology] * pricing.sizeFactor[size];

    const byMultiplier = machine * (pricing.finishFactor[finish] - 1);
    const byFloor = pricing.finishFloor[finish];
    const labor = Math.max(byMultiplier, byFloor);
    floorApplied = byFloor > byMultiplier;

    /* O piso é POR UNIDADE, em qualquer quantidade. O ganho de escala da
       mão de obra (montar a bancada uma vez para o lote inteiro) é real,
       mas só pode consumir a parte que está ACIMA do piso — nunca o piso.
       Sem esta trava, um lote de 200 peças pintadas pagava R$ 40 de mão
       de obra por peça num acabamento cujo mínimo declarado é R$ 50.      */
    const laborTotal = Math.max(
      labor * quantity ** pricing.laborExponent,
      byFloor * quantity,
    );

    const machineTotal = Math.max(
      machine * quantity ** pricing.machineExponent,
      pricing.minUnitPrice * quantity,
    );

    const total =
      (machineTotal + laborTotal + pricing.modelingPrice[modeling]) *
      pricing.urgencyFactor;

    const step = pricing.roundTo;
    const min = Math.ceil((total * pricing.rangeSpread.min) / step) * step;
    const max = Math.round((total * pricing.rangeSpread.max) / step) * step;
    price = { min, max: Math.max(max, min + step) };
  }

  /* ── Premissas ─────────────────────────────────────────────────────── */
  const assumptions = [
    "Peça de complexidade padrão. Geometria, suportes e tempo de máquina podem mudar o valor.",
    modeling === "nenhuma"
      ? "Considera arquivo 3D pronto para impressão."
      : "Inclui a etapa de modelagem digital, com render para sua aprovação antes de imprimir.",
  ];
  if (quantity > 1) {
    assumptions.push(`Considera produção de ${quantity} unidades iguais, no mesmo lote.`);
  }
  if (floorApplied) {
    assumptions.push(
      "O acabamento tem um mínimo de mão de obra: é trabalho manual, independente do tamanho da peça.",
    );
  }
  if (input.deadline === "urgente") {
    assumptions.push("Prazo apertado: confirmamos a viabilidade antes de fechar.");
  }

  return {
    currency: "BRL",
    price,
    priceStatus: pricing.calibrated ? "ok" : "nao_calibrado",
    leadTimeDays: [floorDays, ceilingDays],
    complexity: assessComplexity({ ...input, size, finish, modeling, quantity }),
    recommendedTechnology: technology,
    recommendationReason: reason,
    assumptions,
  };
}
