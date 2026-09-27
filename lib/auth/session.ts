import { prisma } from "@/lib/db";

export async function getOrCreateUserByWallet(walletAddress: string) {
  let user = await prisma.user.findFirst({
    where: { stellarAddress: walletAddress },
    include: { accounts: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        stellarAddress: walletAddress,
        name: "Usuario Paymon",
        email: `${walletAddress.slice(0, 10).toLowerCase()}@paymon.demo`,
        accounts: {
          create: {
            name: "Cuenta principal",
            currency: "MXN",
            balance: 10000,
          },
        },
      },
      include: { accounts: true },
    });

    const account = user.accounts[0];
    await prisma.transaction.createMany({
      data: [
        { accountId: account.id, amount: -350, type: "EXPENSE", category: "FOOD", merchant: "Restaurante", date: new Date(Date.now() - 86400000 * 2) },
        { accountId: account.id, amount: -180, type: "EXPENSE", category: "TRANSPORT", merchant: "Uber", date: new Date(Date.now() - 86400000 * 4) },
        { accountId: account.id, amount: 10000, type: "INCOME", category: "INCOME", merchant: "Depósito inicial", date: new Date() },
      ],
    });
  }

  return user;
}
