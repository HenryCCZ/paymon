import { ActionStatus, Frequency, RecurringStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RecurringPaymentArguments = {
  accountId: string;
  recipientId: string;
  amount: number;
  currency: string;
  frequency: Frequency;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  nextRunAt: string;
};

export async function POST(request: Request) {
  const { actionId } = await request.json();

  if (typeof actionId !== "string" || !actionId) {
    return NextResponse.json(
      { error: "Acción no válida o ya procesada." },
      { status: 400 }
    );
  }

  const action = await prisma.aiAction.findUnique({ where: { id: actionId } });

  if (
    !action ||
    action.action !== "create_recurring_payment" ||
    action.status !== ActionStatus.PENDING_CONFIRMATION
  ) {
    return NextResponse.json(
      { error: "Acción no válida o ya procesada." },
      { status: 400 }
    );
  }

  const args = action.arguments as unknown as RecurringPaymentArguments;

  const payment = await prisma.recurringPayment.create({
    data: {
      userId: action.userId,
      accountId: args.accountId,
      recipientId: args.recipientId,
      amount: args.amount,
      currency: args.currency,
      frequency: args.frequency,
      dayOfWeek: args.dayOfWeek,
      dayOfMonth: args.dayOfMonth,
      nextRunAt: new Date(args.nextRunAt),
      status: RecurringStatus.ACTIVE,
    },
  });

  await prisma.aiAction.update({
    where: { id: action.id },
    data: {
      status: ActionStatus.COMPLETED,
      confirmedAt: new Date(),
      result: { paymentId: payment.id },
    },
  });

  return NextResponse.json({ success: true, paymentId: payment.id });
}