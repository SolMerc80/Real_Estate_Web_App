import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { RatesAndLevyAccountSchema } from "@/schemas/ratesAndLevies";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentDate = new Date();
    const queryMonth = searchParams.get("month") ? Number(searchParams.get("month")) : currentDate.getMonth() + 1;
    const queryYear = searchParams.get("year") ? Number(searchParams.get("year")) : currentDate.getFullYear();
    const search = searchParams.get("search")?.toLowerCase().trim();

    const accounts = await prisma.ratesAndLevy.findMany({
      include: {
        property: {
          select: {
            id: true,
            propertyCode: true,
            propertyName: true,
            address: true,
            city: true,
            status: true,
          },
        },
        entries: {
          orderBy: [
            { year: "desc" },
            { month: "desc" },
          ],
        },
      },
      orderBy: {
        property: { propertyName: "asc" },
      },
    });

    const formatted = accounts.map((acc) => {
      // Find entry matching selected month/year, or latest
      const match = acc.entries.find((e) => e.month === queryMonth && e.year === queryYear);
      const currentEntry = match
        ? {
            id: match.id,
            ratesAndLevyId: match.ratesAndLevyId,
            month: match.month,
            year: match.year,
            amount: Number(match.amount),
            dueDate: match.dueDate ? match.dueDate.toISOString().split("T")[0] : `${queryYear}-${String(queryMonth).padStart(2, "0")}-25`,
            paid: match.paid,
            paidDate: match.paidDate ? match.paidDate.toISOString().split("T")[0] : null,
            updatedAt: match.updatedAt.toISOString(),
          }
        : null;

      return {
        id: acc.id,
        propertyId: acc.propertyId,
        accountName: acc.accountName,
        accountNumber: acc.accountNumber,
        notes: acc.notes,
        property: acc.property,
        currentEntry,
        entries: acc.entries.map((e) => ({
          id: e.id,
          ratesAndLevyId: e.ratesAndLevyId,
          month: e.month,
          year: e.year,
          amount: Number(e.amount),
          dueDate: e.dueDate ? e.dueDate.toISOString().split("T")[0] : null,
          paid: e.paid,
          paidDate: e.paidDate ? e.paidDate.toISOString().split("T")[0] : null,
          updatedAt: e.updatedAt.toISOString(),
        })),
        createdAt: acc.createdAt.toISOString(),
        updatedAt: acc.updatedAt.toISOString(),
      };
    });

    let results = formatted;
    if (search) {
      results = results.filter((item) => {
        const propName = item.property.propertyName.toLowerCase();
        const propCode = item.property.propertyCode.toLowerCase();
        const accName = item.accountName.toLowerCase();
        const accNum = (item.accountNumber || "").toLowerCase();
        return propName.includes(search) || propCode.includes(search) || accName.includes(search) || accNum.includes(search);
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching rates and levies:", error);
    return NextResponse.json(
      { message: "Failed to fetch rates and levies." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RatesAndLevyAccountSchema.safeParse(body);

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
      propertyId,
      accountName,
      accountNumber,
      notes,
      amount,
      month,
      year,
      dueDate,
      paid,
    } = validated.data;

    const account = await prisma.ratesAndLevy.create({
      data: {
        propertyId,
        accountName,
        accountNumber: accountNumber || null,
        notes: notes || null,
      },
      include: {
        property: true,
      },
    });

    // If an initial entry was provided, create it
    if (amount !== undefined && amount !== null && month && year) {
      const defaultDue = dueDate ? new Date(dueDate) : new Date(Date.UTC(year, month - 1, 25));
      await prisma.ratesAndLevyEntry.create({
        data: {
          ratesAndLevyId: account.id,
          month,
          year,
          amount,
          dueDate: defaultDue,
          paid: paid || false,
          paidDate: paid ? new Date() : null,
        },
      });
    }

    const completeAccount = await prisma.ratesAndLevy.findUnique({
      where: { id: account.id },
      include: {
        property: true,
        entries: true,
      },
    });

    return NextResponse.json(completeAccount, { status: 201 });
  } catch (error) {
    console.error("Error creating rates and levy account:", error);
    return NextResponse.json(
      { message: "Failed to create rates and levy account." },
      { status: 500 }
    );
  }
}

