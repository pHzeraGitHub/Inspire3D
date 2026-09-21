import {
  CATEGORIES,
  DEADLINES,
  FINISHES,
  MODELINGS,
  PATHS,
  SIZES,
  TECHNOLOGIES,
} from "@/lib/quote-validation";

/**
 * Inspire AI — o agente que conversa.
 *
 * REGRA QUE SUSTENTA TUDO: a IA conversa, o motor calcula.
 *
 * O trabalho do modelo é UM só — transformar conversa em briefing estruturado.
 * Ele não vê a tabela de preço, não recebe os valores e é proibido de estimar.
 * O número sai de `estimateQuote()` sobre `config/pricing.ts`, determinístico,
 * depois que o briefing está pronto.
 *
 * Isso não é preciosismo: modelo de linguagem inventa preço com toda a
 * confiança do mundo, e um valor alucinado na tela vira compromisso comercial
 * que o estúdio não consegue honrar.
 */

export const INSPIRE_AI_MODEL = process.env.INSPIRE_AI_MODEL || "claude-sonnet-5";

/** Teto de turnos por conversa — controla custo e evita conversa infinita. */
export const MAX_TURNS = 24;
export const MAX_MESSAGE_CHARS = 1200;

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const SYSTEM_PROMPT = `Você é a Inspire AI, assistente da Inspire 3D — um estúdio brasileiro de fabricação criativa que trabalha com impressão 3D FDM e resina, modelagem digital, pintura e acabamento manual.

SUA ÚNICA FUNÇÃO
Conversar com a pessoa para entender o projeto dela e preencher um briefing técnico. Quando tiver informação suficiente, chame a ferramenta registrar_briefing.

PROIBIÇÕES ABSOLUTAS
- NUNCA diga um preço, valor, faixa de preço ou estimativa em reais. Você não tem acesso à tabela de preços do estúdio. O sistema calcula o valor depois que você registra o briefing.
- NUNCA prometa prazo em dias. O sistema calcula.
- NUNCA invente informação sobre a Inspire 3D: número de clientes, prêmios, tempo de mercado, capacidade de produção específica.
- Se perguntarem preço ou prazo, responda que o valor aparece na tela assim que vocês fecharem o briefing, e siga com a próxima pergunta.

COMO CONVERSAR
- Português do Brasil, tom próximo e profissional. Nada de formalidade excessiva, nada de infantilidade.
- UMA pergunta por mensagem. Mensagens curtas, 1 a 3 frases.
- Não peça informação que a pessoa já deu. Não repita o que ela disse de volta em forma de resumo a cada turno.
- Se ela não souber responder algo técnico (tecnologia, tamanho), decida você pelo contexto e siga. Ninguém é obrigado a saber a diferença entre FDM e resina.
- Se a pessoa descrever tudo de uma vez, não invente perguntas para encher linguiça: confirme o que falta e registre.
- Comece descobrindo O QUE a pessoa quer criar antes de qualquer detalhe técnico.

ORDEM SUGERIDA (adapte, não siga como roteiro)
1. O que é a peça e para que serve
2. Se já existe arquivo 3D ou se parte da ideia
3. Tamanho aproximado
4. Quantidade
5. Acabamento desejado
6. Prazo
7. Nome e e-mail para o estúdio responder

DADOS DE CONTATO
Peça nome e e-mail apenas no final, quando o projeto já estiver claro. WhatsApp é opcional — ofereça, não exija.

CONHECIMENTO TÉCNICO QUE VOCÊ PODE USAR
- FDM: peças maiores, funcionais, resistentes. Bom custo para volume.
- Resina: detalhe fino, superfície limpa. Ideal para miniaturas e colecionáveis, e é a base certa quando vai haver pintura.
- Acabamentos: bruto (como sai da máquina), lixado (superfície tratada), pintado (primer, cor e verniz), premium (pintura detalhada, base e montagem).
- Se não há arquivo 3D, a modelagem digital entra como etapa do projeto, com render para aprovação antes de imprimir.
- O estúdio não produz peças que violem direito autoral ou de marca de terceiros. Se a pessoa pedir um personagem licenciado (Marvel, Disney, anime, jogos), explique com naturalidade que o estúdio não reproduz personagem protegido sem autorização do titular, e ofereça seguir com uma criação original ou com um personagem próprio dela.
- O estúdio não produz armas funcionais nem peças que ofereçam risco.

QUANDO REGISTRAR
Chame registrar_briefing assim que tiver, no mínimo: o que é a peça (descrição), categoria, tamanho, acabamento, se há arquivo, quantidade, prazo, nome e e-mail. Antes de chamar, escreva uma frase curta avisando que vai montar a estimativa.`;

/** Ferramenta que o modelo chama quando o briefing está completo. */
export const BRIEFING_TOOL = {
  name: "registrar_briefing",
  description:
    "Registra o briefing do projeto para o estúdio calcular a estimativa. Chame apenas quando tiver todos os campos obrigatórios confirmados pela pessoa.",
  input_schema: {
    type: "object" as const,
    properties: {
      path: {
        type: "string",
        enum: PATHS,
        description:
          "Ponto de partida: arquivo (tem STL pronto), ideia (só a ideia), personalizar, miniatura, serie (várias unidades), prototipo, outro.",
      },
      category: { type: "string", enum: CATEGORIES },
      description: {
        type: "string",
        description:
          "Descrição do projeto nas palavras da pessoa, em 1 a 4 frases. Concreto: o que é, para quem, referências citadas.",
      },
      technology: {
        type: "string",
        enum: TECHNOLOGIES,
        description: "Use 'indefinido' se a pessoa não escolheu — o estúdio recomenda.",
      },
      size: {
        type: "string",
        enum: SIZES,
        description: "pequeno até 8cm, medio 8–15cm, grande 15–25cm, extra acima de 25cm.",
      },
      finish: { type: "string", enum: FINISHES },
      modeling: {
        type: "string",
        enum: MODELINGS,
        description:
          "nenhuma (arquivo pronto), ajuste (arquivo precisa de reparo/escala), completa (modelar do zero).",
      },
      quantity: { type: "integer", minimum: 1, maximum: 10000 },
      dimensions: {
        type: "string",
        description: "Dimensões aproximadas em texto, se a pessoa disse. Ex: '18 × 9 × 9 cm'.",
      },
      deadline: { type: "string", enum: DEADLINES },
      name: { type: "string", description: "Nome da pessoa." },
      email: { type: "string", description: "E-mail para o estúdio responder." },
      phone: { type: "string", description: "WhatsApp, se a pessoa quis informar." },
      company: { type: "string", description: "Empresa, se for projeto corporativo." },
    },
    required: [
      "path",
      "category",
      "description",
      "technology",
      "size",
      "finish",
      "modeling",
      "quantity",
      "deadline",
      "name",
      "email",
    ],
  },
};

/** Primeira fala do agente — server-side, sem gastar chamada de API. */
export const OPENING_MESSAGE =
  "Oi! Me conta o que você quer criar. Pode ser em uma frase, do jeito que estiver na sua cabeça — eu puxo os detalhes daqui.";

/* ── Chamada à API da Anthropic, por HTTP puro (sem SDK) ──────────────── */

type AnthropicBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: unknown };

export type AiTurn =
  | { kind: "reply"; text: string }
  | { kind: "briefing"; text: string; input: Record<string, unknown> }
  | { kind: "error"; message: string };

export async function askInspireAi(messages: ChatMessage[]): Promise<AiTurn> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      kind: "error",
      message: "A Inspire AI ainda não está configurada neste ambiente.",
    };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: INSPIRE_AI_MODEL,
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        tools: [BRIEFING_TOOL],
        messages,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("[inspire-ai] API recusou:", response.status, detail.slice(0, 500));
      return {
        kind: "error",
        message:
          response.status === 429
            ? "Muita gente conversando agora. Tenta de novo em instantes."
            : "Não consegui responder agora. O formulário de orçamento continua funcionando.",
      };
    }

    const data = (await response.json()) as { content?: AnthropicBlock[] };
    const blocks = data.content ?? [];

    const text = blocks
      .filter((b): b is Extract<AnthropicBlock, { type: "text" }> => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    const tool = blocks.find(
      (b): b is Extract<AnthropicBlock, { type: "tool_use" }> =>
        b.type === "tool_use" && b.name === BRIEFING_TOOL.name,
    );

    if (tool && typeof tool.input === "object" && tool.input !== null) {
      return {
        kind: "briefing",
        text: text || "Perfeito. Montei seu briefing — olha o que saiu:",
        input: tool.input as Record<string, unknown>,
      };
    }

    if (!text) {
      return { kind: "error", message: "Não entendi. Pode reformular?" };
    }

    return { kind: "reply", text };
  } catch (error) {
    console.error("[inspire-ai] Falha de rede:", error);
    return {
      kind: "error",
      message: "Falha de conexão. Tenta de novo ou use o formulário de orçamento.",
    };
  }
}
