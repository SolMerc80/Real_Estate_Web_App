import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { RentPaymentSchema } from "@/schemas/rentPayment";
import { PiNewspaperDuotone } from "react-icons/pi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const status = searchParams.get("status"); // 'ALL', 'PAID', 'UNPAID', etc.
    const search = searchParams.get("search")?.toLowerCase().trim();

    // 1. Fetch all existing rent payments
    const payments = await prisma.rentPayment.findMany({
      include: {
        lease: {
          include: {
            property: {
              select: {
                id: true,
                propertyCode: true,
                propertyName: true,
                address: true,
                suburb: true,
                city: true,
                status: true,
              },
            },
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                email: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { id: "desc" },
      ],
    });

    // 2. Map and format payments
    let formattedPayments = payments.map((p) => {
      const dbStatus = p.status;
      // Normalization for UI: ensure 'PAID' or 'UNPAID' (or PENDING/OVERDUE/PARTIAL)
      let displayStatus: string = dbStatus;
      if (dbStatus === "PAID") {
        displayStatus = "PAID";
      } else if (dbStatus === "PENDING" || dbStatus === "OVERDUE") {
        displayStatus = "UNPAID";
      }

      return {
        id: p.id,
        leaseId: p.leaseId,
        month: p.month,
        year: p.year,
        amountDue: p.amountDue ? Number(p.amountDue) : 0,
        amountPaid: p.amountPaid ? Number(p.amountPaid) : 0,
        paymentDate: p.paymentDate ? p.paymentDate.toISOString().split("T")[0] : null,
        status: p.status, // exact DB enum
        displayStatus,   // normalized for UI
        notes: p.notes || "",
        updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
        propertyId: p.lease.propertyId,
        property: p.lease.property,
        tenant: p.lease.tenant,
        lease: {
          id: p.lease.id,
          startDate: p.lease.startDate ? p.lease.startDate.toISOString().split("T")[0] : undefined,
          endDate: p.lease.endDate ? p.lease.endDate.toISOString().split("T")[0] : undefined,
          monthlyRent: p.lease.monthlyRent ? Number(p.lease.monthlyRent) : 0,
          status: p.lease.status,
        },
      };
    });

    // If there are currently no payments recorded, check if there are active leases and generate default records for current month so the table is never blank
    if (formattedPayments.length === 0) {
      const activeLeases = await prisma.lease.findMany({
        where: {
          status: { in: ["ACTIVE", "CRITICAL", "EXPIRING_SOON"] },
        },
        include: {
          property: true,
          tenant: true,
        },
      });

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // 1-12

      for (const lease of activeLeases) {
        try {
          const created = await prisma.rentPayment.create({
            data: {
              leaseId: lease.id,
              month: currentMonth,
              year: currentYear,
              amountDue: lease.monthlyRent,
              amountPaid: 0,
              status: "PENDING",
              notes: "Initial tracking entry",
            },
            include: {
              lease: {
                include: {
                  property: true,
                  tenant: true,
                },
              },
            },
          });

          formattedPayments.push({
            id: created.id,
            leaseId: created.leaseId,
            month: created.month,
            year: created.year,
            amountDue: Number(created.amountDue),
            amountPaid: 0,
            paymentDate: null,
            status: created.status,
            displayStatus: "UNPAID" as string,
            notes: created.notes || "",
            updatedAt: created.updatedAt.toISOString(),
            propertyId: lease.propertyId,
            property: lease.property,
            tenant: lease.tenant,
            lease: {
              id: lease.id,
              startDate: lease.startDate ? lease.startDate.toISOString().split("T")[0] : undefined,
              endDate: lease.endDate ? lease.endDate.toISOString().split("T")[0] : undefined,
              monthlyRent: Number(lease.monthlyRent),
              status: lease.status,
            },
          });
        } catch {
          // Ignore unique constraint collision if already created concurrently
        }
      }
    }

    // Apply optional server-side filters if requested
    if (year && year !== "ALL") {
      const y = parseInt(year, 10);
      formattedPayments = formattedPayments.filter((p) => p.year === y);
    }

    if (month && month !== "ALL") {
      const m = parseInt(month, 10);
      formattedPayments = formattedPayments.filter((p) => p.month === m);
    }

    if (status && status !== "ALL") {
      if (status === "PAID") {
        formattedPayments = formattedPayments.filter((p) => p.status === "PAID");
      } else if (status === "UNPAID") {
        formattedPayments = formattedPayments.filter(
          (p) => p.status === "PENDING" || p.status === "OVERDUE" || p.status === "PARTIAL"
        );
      } else {
        formattedPayments = formattedPayments.filter((p) => p.status === status);
      }
    }

    if (search) {
      formattedPayments = formattedPayments.filter((p) => {
        const propName = (p.property?.propertyName || "").toLowerCase();
        const propAddr = (p.property?.address || "").toLowerCase();
        const propCity = (p.property?.city || "").toLowerCase();
        const propCode = (p.property?.propertyCode || "").toLowerCase();
        const propId = String(p.propertyId);
        const tenantName = `${p.tenant?.firstName || ""} ${p.tenant?.lastName || ""}`.toLowerCase();
        const notes = (p.notes || "").toLowerCase();

        return (
          propName.includes(search) ||
          propAddr.includes(search) ||
          propCity.includes(search) ||
          propCode.includes(search) ||
          propId.includes(search) ||
          tenantName.includes(search) ||
          notes.includes(search)
        );
      });
    }

    return NextResponse.json(formattedPayments);
  } catch (error) {
    console.error("Error fetching rent payments:", error);
    return NextResponse.json(
      { message: "Failed to fetch rent payments." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validated = RentPaymentSchema.safeParse(body);
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
      leaseId,
      year,
      month,
      amountDue,
      amountPaid,
      paymentDate,
      status,
      notes,
    } = validated.data;

    // Determine clean payment status
    let finalStatus = status;
    if (amountPaid >= amountDue && amountDue > 0) {
      finalStatus = "PAID";
    } else if (amountPaid > 0 && amountPaid < amountDue) {
      finalStatus = "PARTIAL";
    }

    const payDate = paymentDate
      ? new Date(paymentDate)
      : finalStatus === "PAID"
      ? new Date()
      : null;

    // Create or update if duplicate for same lease, month, year
    const newRentPayment = await prisma.rentPayment.upsert({
      where: {
        leaseId_month_year: {
          leaseId,
          month,
          year,
        },
      },
      update: {
        amountDue,
        amountPaid,
        paymentDate: payDate,
        status: finalStatus,
        notes: notes || null,
      },
      create: {
        leaseId,
        month,
        year,
        amountDue,
        amountPaid,
        paymentDate: payDate,
        status: finalStatus,
        notes: notes || null,
      },
      include: {
        lease: {
          include: {
            property: true,
            tenant: true,
          },
        },
      },
    });

    return NextResponse.json(newRentPayment, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating rent payment:", error);
    return NextResponse.json(
      { message: "Failed to record rent payment." },
      { status: 500 }
    );
  }
}