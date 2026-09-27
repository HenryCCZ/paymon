import { PrismaClient, Category, TxType, Frequency, RecurringStatus } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  // Limpieza para poder re-correr el seed sin duplicar datos
  await prisma.cryptoTransaction.deleteMany();
  await prisma.aiAction.deleteMany();
  await prisma.recurringPayment.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.recipient.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: { id: "demo-user-001", name: "Demo User", email: "demo@paymon.app" },
  });

  const account = await prisma.account.create({
    data: { userId: user.id, name: "MXN Checking", currency: "MXN", balance: 24580.0 },
  });

  const netflix = await prisma.recipient.create({ data: { userId: user.id, name: "Netflix" } });
  const internet = await prisma.recipient.create({ data: { userId: user.id, name: "Totalplay" } });
  const spotify = await prisma.recipient.create({ data: { userId: user.id, name: "Spotify" } });
  await prisma.recipient.create({ data: { userId: user.id, name: "Juan" } }); // para el demo en vivo del agente

  await prisma.recurringPayment.createMany({
    data: [
      { userId: user.id, accountId: account.id, recipientId: netflix.id, amount: 219, frequency: Frequency.MONTHLY, dayOfMonth: 15, nextRunAt: daysAgo(-15), status: RecurringStatus.ACTIVE },
      { userId: user.id, accountId: account.id, recipientId: internet.id, amount: 599, frequency: Frequency.MONTHLY, dayOfMonth: 20, nextRunAt: daysAgo(-20), status: RecurringStatus.ACTIVE },
      { userId: user.id, accountId: account.id, recipientId: spotify.id, amount: 129, frequency: Frequency.MONTHLY, dayOfMonth: 25, nextRunAt: daysAgo(-25), status: RecurringStatus.ACTIVE },
    ],
  });

  const tx: { amount: number; type: TxType; category: Category; merchant: string; daysAgo: number }[] = [
    { amount: 15000, type: TxType.INCOME, category: Category.INCOME, merchant: "Nómina", daysAgo: 3 },
    { amount: 15000, type: TxType.INCOME, category: Category.INCOME, merchant: "Nómina", daysAgo: 33 },
    { amount: 15000, type: TxType.INCOME, category: Category.INCOME, merchant: "Nómina", daysAgo: 63 },

    { amount: -320, type: TxType.EXPENSE, category: Category.FOOD, merchant: "Restaurante La Cabaña", daysAgo: 2 },
    { amount: -850, type: TxType.EXPENSE, category: Category.FOOD, merchant: "Mercado", daysAgo: 5 },
    { amount: -180, type: TxType.EXPENSE, category: Category.FOOD, merchant: "Delivery App", daysAgo: 7 },
    { amount: -410, type: TxType.EXPENSE, category: Category.FOOD, merchant: "El Buen Sabor", daysAgo: 12 },
    { amount: -690, type: TxType.EXPENSE, category: Category.FOOD, merchant: "Mercado", daysAgo: 19 },
    { amount: -220, type: TxType.EXPENSE, category: Category.FOOD, merchant: "Delivery App", daysAgo: 24 },
    { amount: -390, type: TxType.EXPENSE, category: Category.FOOD, merchant: "Restaurante La Cabaña", daysAgo: 34 },
    { amount: -760, type: TxType.EXPENSE, category: Category.FOOD, merchant: "Mercado", daysAgo: 41 },

    { amount: -180, type: TxType.EXPENSE, category: Category.TRANSPORT, merchant: "Uber", daysAgo: 1 },
    { amount: -95, type: TxType.EXPENSE, category: Category.TRANSPORT, merchant: "Uber", daysAgo: 6 },
    { amount: -500, type: TxType.EXPENSE, category: Category.TRANSPORT, merchant: "Gasolinera", daysAgo: 10 },
    { amount: -120, type: TxType.EXPENSE, category: Category.TRANSPORT, merchant: "Uber", daysAgo: 15 },
    { amount: -500, type: TxType.EXPENSE, category: Category.TRANSPORT, merchant: "Gasolinera", daysAgo: 38 },

    { amount: -219, type: TxType.EXPENSE, category: Category.SERVICES, merchant: "Netflix", daysAgo: 15 },
    { amount: -599, type: TxType.EXPENSE, category: Category.SERVICES, merchant: "Totalplay", daysAgo: 20 },
    { amount: -129, type: TxType.EXPENSE, category: Category.SERVICES, merchant: "Spotify", daysAgo: 25 },
    { amount: -219, type: TxType.EXPENSE, category: Category.SERVICES, merchant: "Netflix", daysAgo: 45 },
    { amount: -599, type: TxType.EXPENSE, category: Category.SERVICES, merchant: "Totalplay", daysAgo: 50 },

    { amount: -280, type: TxType.EXPENSE, category: Category.ENTERTAINMENT, merchant: "Cinépolis", daysAgo: 9 },
    { amount: -450, type: TxType.EXPENSE, category: Category.ENTERTAINMENT, merchant: "Boletos concierto", daysAgo: 29 },

    { amount: -650, type: TxType.EXPENSE, category: Category.SHOPPING, merchant: "Amazon", daysAgo: 4 },
    { amount: -1200, type: TxType.EXPENSE, category: Category.SHOPPING, merchant: "Liverpool", daysAgo: 22 },
    { amount: -380, type: TxType.EXPENSE, category: Category.SHOPPING, merchant: "Amazon", daysAgo: 47 },
  ];

  await prisma.transaction.createMany({
    data: tx.map((t) => ({
      accountId: account.id,
      amount: t.amount,
      type: t.type,
      category: t.category,
      merchant: t.merchant,
      date: daysAgo(t.daysAgo),
    })),
  });

  console.log("Seed listo:", { userId: user.id, accountId: account.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });