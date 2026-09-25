import { account, transactions } from "./data";

export function getBalance() {
  return {
    balance: account.balance,
    currency: account.currency,
  };
}

export function getSpendingByCategory(category: string) {
  const movimientos = transactions.filter(
    (transaction) =>
      transaction.category.toLowerCase() === category.toLowerCase()
  );

  const total = movimientos.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  return {
    category,
    total,
    currency: account.currency,
    transactions: movimientos,
  };
}

export function getTransactions() {
  return transactions;
}

export function getSpendingSummary() {
  const summary: Record<string, number> = {};

  for (const transaction of transactions) {
    if (!summary[transaction.category]) {
      summary[transaction.category] = 0;
    }

    summary[transaction.category] += transaction.amount;
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
    currency: account.currency,
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