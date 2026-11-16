import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { LeaseSchema } from "@/schemas/lease";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // optional: CRITICAL, EXPIRING_SOON, ACTIVE, EXPIRED

    const leases = await prisma.lease.findMany({
      include: {
        property: {
          select: {
            id: true,
            propertyCode: true,
            propertyName: true,
            address: true,
            suburb: true,
            city: true,
            province: true,
            postalCode: true,
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
      orderBy: {
        endDate: "asc", // Order closest to expiration first
      },
    });

    const now = new Date();
    // Normalize to beginning of today in UTC to get accurate whole-day difference
    const startOfToday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    const formattedLeases = leases.map((lease) => {
      const end = new Date(lease.endDate);
      const endUTC = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));

      const diffTime = endUTC.getTime() - startOfToday.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let calculatedStatus: "EXPIRED" | "CRITICAL" | "EXPIRING_SOON" | "ACTIVE" = "ACTIVE";

      if (daysRemaining < 0 || lease.status === "EXPIRED" || lease.status === "TERMINATED") {
        calculatedStatus = "EXPIRED";
      } else if (daysRemaining <= 30) {
        calculatedStatus = "CRITICAL";
      } else if (daysRemaining <= 90) {
        calculatedStatus = "EXPIRING_SOON";
      } else {
        calculatedStatus = "ACTIVE";
      }

      return {
        id: lease.id,
        propertyId: lease.propertyId,
        tenantId: lease.tenantId,
        startDate: lease.startDate ? lease.startDate.toISOString().split("T")[0] : "",
        endDate: lease.endDate ? lease.endDate.toISOString().split("T")[0] : "",
        monthlyRent: lease.monthlyRent ? Number(lease.monthlyRent) : 0,
        depositHeld: lease.depositHeld ? Number(lease.depositHeld) : null,
        dbStatus: lease.status,
        calculatedStatus,
        daysRemaining,
        renewalDate: lease.renewalDate ? lease.renewalDate.toISOString().split("T")[0] : null,
        leaseReference: lease.leaseReference || null,
        property: lease.property,
        tenant: lease.tenant,
      };
    });

    if (filter && ["CRITICAL", "EXPIRING_SOON", "ACTIVE", "EXPIRED"].includes(filter.toUpperCase())) {
      const filtered = formattedLeases.filter(
        (l) => l.calculatedStatus === filter.toUpperCase()
      );
      return NextResponse.json(filtered);
    }

    return NextResponse.json(formattedLeases);
  } catch (error) {
    console.error("Error fetching leases:", error);
    return NextResponse.json(
      { message: "Failed to fetch leases." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validated = LeaseSchema.safeParse(body);
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
      tenantId,
      startDate,
      endDate,
      monthlyRent,
      depositHeld,
      status,
      leaseReference,
    } = validated.data;

    const newLease = await prisma.lease.create({
      data: {
        propertyId,
        tenantId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        monthlyRent,
        depositHeld: depositHeld ?? null,
        status,
        leaseReference: leaseReference ?? null,
      },
      include: {
        property: true,
        tenant: true,
      },
    });

    return NextResponse.json(newLease, { status: 201 });
  } catch (error) {
    console.error("Error creating lease:", error);
    return NextResponse.json(
      { message: "Failed to create lease." },
      { status: 500 }
    );
  }
}