import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { RatesAndLevyUpdateSchema } from "@/schemas/ratesAndLevies";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accountId = Number(id);

    if (isNaN(accountId) || accountId <= 0) {
      return NextResponse.json({ message: "Invalid account ID." }, { status: 400 });
    }

    const body = await request.json();
    const validated = RatesAndLevyUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          message: "Validation failed.",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      accountName,
      accountNumber,
      amount,
      dueDate,
      paid,
      paidDate,
      togglePaid,
      notes,
    } = validated.data;

    // Optional query params for context of which month/year is being modified
    const { searchParams } = new URL(request.url);
    const currentDate = new Date();
    const targetMonth = searchParams.get("month") ? Number(searchParams.get("month")) : (body.month ? Number(body.month) : currentDate.getMonth() + 1);
    const targetYear = searchParams.get("year") ? Number(searchParams.get("year")) : (body.year ? Number(body.year) : currentDate.getFullYear());

    // 1. Update account details if provided
    if (accountName !== undefined || accountNumber !== undefined || notes !== undefined) {
      await prisma.ratesAndLevy.update({
        where: { id: accountId },
        data: {
          ...(accountName !== undefined ? { accountName } : {}),
          ...(accountNumber !== undefined ? { accountNumber: accountNumber || null } : {}),
          ...(notes !== undefined ? { notes: notes || null } : {}),
        },
      });
    }

    // 2. Handle entry update (amount, due date, or paid toggle)
    const existingEntry = await prisma.ratesAndLevyEntry.findUnique({
      where: {
        ratesAndLevyId_month_year: {
          ratesAndLevyId: accountId,
          month: targetMonth,
          year: targetYear,
        },
      },
    });

    let newPaidStatus = existingEntry ? existingEntry.paid : false;
    let newPaidDate = existingEntry ? existingEntry.paidDate : null;

    if (togglePaid) {
      newPaidStatus = !newPaidStatus;
      newPaidDate = newPaidStatus ? new Date() : null;
    } else if (paid !== undefined) {
      newPaidStatus = paid;
      newPaidDate = paid ? (paidDate ? new Date(paidDate) : new Date()) : null;
    }

    const defaultDue = dueDate
      ? new Date(dueDate)
      : existingEntry?.dueDate || new Date(Date.UTC(targetYear, targetMonth - 1, 25));

    const finalAmount = amount !== undefined ? amount : (existingEntry ? Number(existingEntry.amount) : 0);

    await prisma.ratesAndLevyEntry.upsert({
      where: {
        ratesAndLevyId_month_year: {
          ratesAndLevyId: accountId,
          month: targetMonth,
          year: targetYear,
        },
      },
      update: {
        amount: finalAmount,
        dueDate: defaultDue,
        paid: newPaidStatus,
        paidDate: newPaidDate,
      },
      create: {
        ratesAndLevyId: accountId,
        month: targetMonth,
        year: targetYear,
        amount: finalAmount,
        dueDate: defaultDue,
        paid: newPaidStatus,
        paidDate: newPaidDate,
      },
    });

    const updatedAccount = await prisma.ratesAndLevy.findUnique({
      where: { id: accountId },
      include: {
        property: true,
        entries: true,
      },
    });

    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error("Error updating rates and levies:", error);
    return NextResponse.json(
      { message: "Failed to update rates and levies." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accountId = Number(id);

    if (isNaN(accountId) || accountId <= 0) {
      return NextResponse.json({ message: "Invalid account ID." }, { status: 400 });
    }

    await prisma.ratesAndLevyEntry.deleteMany({
      where: { ratesAndLevyId: accountId },
    });

    await prisma.ratesAndLevy.delete({
      where: { id: accountId },
    });

    return NextResponse.json({ message: "Rates and levy account deleted successfully." });
  } catch (error) {
    console.error("Error deleting rates and levy account:", error);
    return NextResponse.json(
      { message: "Failed to delete rates and levy account." },
      { status: 500 }
    );
  }
}

