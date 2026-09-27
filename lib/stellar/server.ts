import { Horizon } from "@stellar/stellar-sdk";

export const server = new Horizon.Server(
  process.env.STELLAR_HORIZON_URL ?? "https://horizon-testnet.stellar.org"
);