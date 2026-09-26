import { GoogleGenAI } from "@google/genai";

import {
  getBalance,
  getSpendingByCategory,
  getTransactions,
  getSpendingSummary,
  getRecurringPayments,
  proposeRecurringPayment,
  proposeCryptoTransaction,
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
  {
    type: "function",
    name: "getRecurringPayments",
    description:
      "Obtiene los pagos recurrentes activos del usuario y sus destinatarios.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "proposeRecurringPayment",
    description:
      "Prepara una propuesta de pago recurrente que el usuario debe " +
      "confirmar explícitamente antes de crearse. Nunca ejecuta el pago " +
      "directamente ni debe decirse al usuario que ya fue creado.",
    parameters: {
      type: "object",
      properties: {
        recipientName: { type: "string", description: "Nombre del destinatario" },
        amount: { type: "number", description: "Monto del pago" },
        frequency: { type: "string", enum: ["WEEKLY", "MONTHLY"] },
        dayOfWeek: { type: "number", description: "0=domingo..6=sábado, solo si frequency es WEEKLY" },
        dayOfMonth: { type: "number", description: "1-31, solo si frequency es MONTHLY" },
      },
      required: ["recipientName", "amount", "frequency"],
    },
  },
  {
    type: "function",
    name: "proposeCryptoTransaction",
    description:
      "Prepara una propuesta de transferencia en Stellar (XLM) que el " +
      "usuario debe confirmar y firmar desde su wallet. Nunca la envía " +
      "directamente ni debe decirse al usuario que ya se envió.",
    parameters: {
      type: "object",
      properties: {
        toAddress: { type: "string", description: "Dirección Stellar (formato G...) del destinatario" },
        amount: { type: "number", description: "Cantidad de XLM a enviar" },
      },
      required: ["toAddress", "amount"],
    },
  },

] as any[];

async function executeTool(
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

    case "getRecurringPayments":
      return getRecurringPayments();

    case "proposeRecurringPayment":
      return proposeRecurringPayment(
        String(args.recipientName ?? ""),
        Number(args.amount ?? 0),
        args.frequency === "WEEKLY" ? "WEEKLY" : "MONTHLY",
        args.dayOfWeek !== undefined ? Number(args.dayOfWeek) : undefined,
        args.dayOfMonth !== undefined ? Number(args.dayOfMonth) : undefined
      );

    case "proposeCryptoTransaction":
      return proposeCryptoTransaction(
        String(args.toAddress ?? ""),
        Number(args.amount ?? 0)
      );

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
- Para consultar pagos recurrentes activos utiliza getRecurringPayments.
- Para programar un pago recurrente utiliza proposeRecurringPayment. NUNCA digas que el pago ya fue creado o confirmado: solo describe la propuesta (destinatario, monto, frecuencia) y explica que el usuario debe confirmarla.
- Para preparar una transferencia en Stellar utiliza proposeCryptoTransaction. NUNCA digas que ya se envió: solo describe la propuesta y explica que el usuario debe confirmarla y firmarla desde su wallet.
- No ejecutes transferencias todavía.

Pregunta del usuario:

${message}
`;

  let previousInteractionId: string | undefined;
  let iteration = 0;
  let pendingAction: any | null = null;

  while (true) {
    iteration += 1;
    console.log("PAYMON ITERATION:", iteration);
    console.time("ai.interactions.create");
    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input,
      tools,
      previous_interaction_id: previousInteractionId,
    });
    console.timeEnd("ai.interactions.create");

    const functionCalls = (interaction.steps ?? []).filter(
      (step) => step.type === "function_call"
    );

    if (functionCalls.length === 0) {
      return {
        text: interaction.output_text ?? "No pude generar una respuesta.",
        pendingAction,
      };
    }

    const toolResults = await Promise.all(functionCalls.map(async (call: any) => {
      console.log(
        "PAYMON TOOL:",
        call.name,
        call.arguments
      );

      const result = await executeTool(
        call.name,
        call.arguments ?? {}
      );

      return {
        name: call.name,
        result,
        functionResult: {
        type: "function_result",
        name: call.name,
        call_id: call.id,
        result: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
        },
      };
    }));

    const proposedAction = toolResults.find(
      (toolResult) =>
        toolResult.name === "proposeRecurringPayment" ||
        toolResult.name === "proposeCryptoTransaction"
    );
    if (proposedAction) {
      pendingAction = proposedAction.result;
    }

    const functionResults = toolResults.map(
      (toolResult) => toolResult.functionResult
    );

    input = functionResults;
    previousInteractionId = interaction.id;
  }
}