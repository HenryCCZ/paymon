// lib/stellar/wallet.ts
import { Keypair, TransactionBuilder, Networks, Operation, Asset } from "@stellar/stellar-sdk";
import { server } from "./server";

export function generateKeypair() {
  const kp = Keypair.random();
  return { publicKey: kp.publicKey(), secretKey: kp.secret() };
}

export async function fundTestnetAccount(publicKey: string) {
  const res = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
  if (!res.ok) throw new Error("No se pudo fondear la cuenta en testnet");
}

export async function getBalance(publicKey: string) {
  const account = await server.loadAccount(publicKey);
  return account.balances;
}

export async function sendPayment(secretKey: string, destination: string, amount: string) {
  const source = Keypair.fromSecret(secretKey);
  const account = await server.loadAccount(source.publicKey());

  const tx = new TransactionBuilder(account, {
    fee: (await server.fetchBaseFee()).toString(),
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.payment({ destination, asset: Asset.native(), amount }))
    .setTimeout(30)
    .build();

  tx.sign(source);
  return server.submitTransaction(tx);
}