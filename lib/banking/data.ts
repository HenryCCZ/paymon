export type Transaction = {
  id: number;
  description: string;
  category: string;
  amount: number;
  date: string;
};

export const account = {
  id: "acc-001",
  owner: "Enrique",
  balance: 12450,
  currency: "MXN",
};

export const transactions: Transaction[] = [
  {
    id: 1,
    description: "McDonald's",
    category: "comida",
    amount: 180,
    date: "2026-09-02",
  },
  {
    id: 2,
    description: "Uber",
    category: "transporte",
    amount: 95,
    date: "2026-09-03",
  },
  {
    id: 3,
    description: "Supermercado Walmart",
    category: "comida",
    amount: 430,
    date: "2026-09-05",
  },
  {
    id: 4,
    description: "Steam",
    category: "videojuegos",
    amount: 899,
    date: "2026-09-07",
  },
  {
    id: 5,
    description: "Starbucks",
    category: "comida",
    amount: 120,
    date: "2026-09-10",
  },
  {
    id: 6,
    description: "Uber",
    category: "transporte",
    amount: 75,
    date: "2026-09-11",
  },
  {
    id: 7,
    description: "Taquería El Güero",
    category: "comida",
    amount: 250,
    date: "2026-09-12",
  },
  {
    id: 8,
    description: "Cine",
    category: "entretenimiento",
    amount: 180,
    date: "2026-09-15",
  },
  {
    id: 9,
    description: "Rappi",
    category: "comida",
    amount: 390,
    date: "2026-09-18",
  },
  {
    id: 10,
    description: "Uber",
    category: "transporte",
    amount: 110,
    date: "2026-09-20",
  },
];