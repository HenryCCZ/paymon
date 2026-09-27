import { ActionStatus, Category, RecurringStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

const DEMO_USER_ID = "demo-user-001";

const categoryBySpanishName: Record<string, Category> = {
  comida: Category.FOOD,
  alimentos: Category.FOOD,
  transporte: Category.TRANSPORT,
  entretenimiento: Category.ENTERTAINMENT,
  videojuegos: Category.ENTERTAINMENT,
  servicios: Category.SERVICES,
  compras: Category.SHOPPING,
  shopping: Category.SHOPPING,
  ingreso: Category.INCOME,
  ingresos: Category.INCOME,
  otros: Category.OTHER,
  otro: Category.OTHER,
};

function normalizeCategory(category: string) {
  return category
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export async function getBalance() {
  const account = await prisma.account.findFirst({
    where: { userId: DEMO_USER_ID },
  });

  return {
    balance: account?.balance.toString() ?? "0",
    currency: account?.currency ?? "MXN",
  };
}

export async function getSpendingByCategory(category: string) {
  const account = await prisma.account.findFirst({
    where: { userId: DEMO_USER_ID },
    select: { currency: true },
  });
  const prismaCategory = categoryBySpanishName[normalizeCategory(category)];

  if (!prismaCategory) {
    return {
      category,
      total: 0,
      currency: account?.currency ?? "MXN",
      transactions: [],
    };
  }

  const movimientos = await prisma.transaction.findMany({
    where: {
      category: prismaCategory,
      account: { is: { userId: DEMO_USER_ID } },
    },
    orderBy: { date: "desc" },
  });

  const total = movimientos.reduce(
    (sum, transaction) => sum + Number(transaction.amount),
    0
  );

  return {
    category,
    total,
    currency: account?.currency ?? "MXN",
    transactions: movimientos,
  };
}

export async function getTransactions() {
  return prisma.transaction.findMany({
    where: {
      account: { is: { userId: DEMO_USER_ID } },
    },
    include: { account: true },
    orderBy: { date: "desc" },
  });
}

export async function getSpendingSummary() {
  const [groups, account] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["category"],
      where: {
        account: { is: { userId: DEMO_USER_ID } },
      },
      _sum: { amount: true },
    }),
    prisma.account.findFirst({
      where: { userId: DEMO_USER_ID },
      select: { currency: true },
    }),
  ]);

  const summary: Record<string, number> = {};

  for (const group of groups) {
    summary[group.category] = Number(group._sum.amount ?? 0);
  }

  const totalSpent = Object.values(summary).reduce(
    (sum, amount) => sum + amount,
    0
  );

  const highestCategory = Object.entries(summary).reduce(
    (highest, current) => {
      if (!highest || current[1] > highest[1]) {
        return current;
      }

      return highest;
    },
    null as [string, number] | null
  );

  return {
    currency: account?.currency ?? "MXN",
    totalSpent,
    byCategory: summary,
    highestCategory: highestCategory
      ? {
          category: highestCategory[0],
          amount: highestCategory[1],
        }
      : null,
  };
}

export async function getRecurringPayments() {
  return prisma.recurringPayment.findMany({
    where: {
      userId: DEMO_USER_ID,
      status: RecurringStatus.ACTIVE,
    },
    include: {
      recipient: {
        select: { name: true },
      },
    },
    orderBy: { nextRunAt: "asc" },
  });
}

export async function proposeRecurringPayment(
  recipientName: string,
  amount: number,
  frequency: "WEEKLY" | "MONTHLY",
  dayOfWeek?: number,
  dayOfMonth?: number
) {
  const account = await prisma.account.findFirst({
    where: { userId: DEMO_USER_ID },
  });
  if (!account) throw new Error("No se encontró la cuenta del usuario.");

  let recipient = await prisma.recipient.findFirst({
    where: {
      userId: DEMO_USER_ID,
      name: { equals: recipientName, mode: "insensitive" },
    },
  });
  if (!recipient) {
    recipient = await prisma.recipient.create({
      data: { userId: DEMO_USER_ID, name: recipientName },
    });
  }

  const nextRunAt = new Date();
  nextRunAt.setDate(nextRunAt.getDate() + 1);

  const action = await prisma.aiAction.create({
    data: {
      userId: DEMO_USER_ID,
      action: "create_recurring_payment",
      status: ActionStatus.PENDING_CONFIRMATION,
      arguments: {
        accountId: account.id,
        recipientId: recipient.id,
        recipientName: recipient.name,
        amount,
        currency: account.currency,
        frequency,
        dayOfWeek: dayOfWeek ?? null,
        dayOfMonth: dayOfMonth ?? null,
        nextRunAt: nextRunAt.toISOString(),
      },
    },
  });

  return {
    actionId: action.id,
    recipientName: recipient.name,
    amount,
    currency: account.currency,
    frequency,
    dayOfWeek: dayOfWeek ?? null,
    dayOfMonth: dayOfMonth ?? null,
  };
}

export async function proposeCryptoTransaction(
  toAddress: string,
  amount: number
) {
  if (amount <= 0) throw new Error("Monto inválido.");

  const action = await prisma.aiAction.create({
    data: {
      userId: DEMO_USER_ID,
      action: "create_crypto_transaction",
      status: ActionStatus.PENDING_CONFIRMATION,
      arguments: {
        toAddress,
        amount,
        token: "XLM",
        network: "stellar-testnet",
      },
    },
  });

  return {
    actionId: action.id,
    type: "crypto",
    toAddress,
    amount,
    token: "XLM",
  };
}