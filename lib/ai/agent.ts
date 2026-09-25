import { GoogleGenAI } from "@google/genai";

import {
  getBalance,
  getSpendingByCategory,
  getTransactions,
  getSpendingSummary,
} from "@/lib/banking/tools";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("No se encontró GEMINI_API_KEY.");
}

const ai = new GoogleGenAI({
  apiKey,
});

const tools = [ 
  {
    type: "function",
    name: "getBalance",
    description:
      "Consulta el saldo disponible de la cuenta bancaria del usuario.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "getSpendingByCategory",
    description:
      "Calcula cuánto dinero ha gastado el usuario en una categoría específica.",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description:
            "Categoría del gasto, por ejemplo comida, transporte o videojuegos.",
        },
      },
      required: ["category"],
    },
  },
  {
    type: "function",
    name: "getTransactions",
    description:
      "Obtiene los movimientos y transacciones de la cuenta del usuario.",
    parameters: {
      type: "object",
      properties: {},
    },
  },

    {
    type: "function",
    name: "getSpendingSummary",
    description:
      "Genera un resumen de cuánto ha gastado el usuario por categoría y determina cuál es su categoría de mayor gasto.",
    parameters: {
      type: "object",
      properties: {},
    },
  },

] as any[];

function executeTool(
  name: string,
  args: Record<string, unknown> = {}
) {
  switch (name) {
    case "getBalance":
      return getBalance();

    case "getSpendingByCategory":
      return getSpendingByCategory(
        String(args.category ?? "")
      );

    case "getTransactions":
      return getTransactions();
      
    case "getSpendingSummary":
      return getSpendingSummary();

    default:
      throw new Error(`Herramienta desconocida: ${name}`);
  }
}

export async function askPaymon(message: string) {
  let input: any = `
Eres Paymon, un agente financiero inteligente.

Reglas:
- Responde siempre en español.
- Sé claro y breve.
- Nunca inventes datos financieros.
- Para consultar saldo utiliza getBalance.
- Para consultar gastos por categoría utiliza getSpendingByCategory.
- Para consultar movimientos utiliza getTransactions.
- Para preguntas como "¿en qué estoy gastando más?", "dame un resumen de mis gastos" o "¿cuál es mi mayor gasto?", utiliza getSpendingSummary.
- No ejecutes transferencias todavía.

Pregunta del usuario:

${message}
`;

  let previousInteractionId: string | undefined;

  while (true) {
    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input,
      tools,
      previous_interaction_id: previousInteractionId,
    });

    const functionCalls = (interaction.steps ?? []).filter(
      (step) => step.type === "function_call"
    );

    if (functionCalls.length === 0) {
      return interaction.output_text ?? "No pude generar una respuesta.";
    }

    const functionResults = functionCalls.map((call: any) => {
      console.log(
        "PAYMON TOOL:",
        call.name,
        call.arguments
      );

      const result = executeTool(
        call.name,
        call.arguments ?? {}
      );

      return {
        type: "function_result",
        name: call.name,
        call_id: call.id,
        result: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    });

    input = functionResults;
    previousInteractionId = interaction.id;
  }
}