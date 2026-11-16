import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { TenantSchema } from "@/schemas/tenant";

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
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
        leases: {
          orderBy: { startDate: "desc" },
          take: 1,
        },
        moveRecords: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedTenants = tenants.map((t) => ({
      ...t,
      leases: t.leases.map((l) => ({
        ...l,
        monthlyRent: l.monthlyRent ? l.monthlyRent.toString() : "0",
        startDate: l.startDate ? l.startDate.toISOString().split("T")[0] : "",
        endDate: l.endDate ? l.endDate.toISOString().split("T")[0] : "",
      })),
      moveRecords: t.moveRecords.map((m) => ({
        ...m,
        moveInDate: m.moveInDate ? m.moveInDate.toISOString().split("T")[0] : null,
        moveOutDate: m.moveOutDate ? m.moveOutDate.toISOString().split("T")[0] : null,
      })),
    }));

    return NextResponse.json(formattedTenants);
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json(
      { message: "Failed to fetch tenants." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = TenantSchema.safeParse(body);
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
      firstName,
      lastName,
      phoneNumber,
      email,
      propertyId,
      status,
      monthlyRent,
      leaseStartDate,
      leaseEndDate,
      moveInDate,
      moveOutDate,
      notes,
    } = validated.data;
    const newTenant = await prisma.tenant.create({
      data: {
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
        email: email || null,
        propertyId,
        status,
        notes: notes || null,
      },
      include: {
        property: true,
      },
    });
    // If lease details provided, create initial lease
    if (leaseStartDate && leaseEndDate) {
      await prisma.lease.create({
        data: {
          tenantId: newTenant.id,
          propertyId,
          startDate: new Date(leaseStartDate),
          endDate: new Date(leaseEndDate),
          monthlyRent: monthlyRent ?? 0,
          status: status === "ACTIVE" ? "ACTIVE" : "TERMINATED",
        },
      });
    }
    // Create Move Record if dates or notes provided
    if (moveInDate || moveOutDate || notes) {
      await prisma.moveRecord.create({
        data: {
          tenantId: newTenant.id,
          propertyId,
          moveInDate: moveInDate ? new Date(moveInDate) : new Date(),
          moveOutDate: moveOutDate ? new Date(moveOutDate) : null,
          notes: notes || null,
        },
      });
    }
    // If active tenant added, update property status to OCCUPIED
    if (status === "ACTIVE") {
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: "OCCUPIED" },
      });
    }
    const completeTenant = await prisma.tenant.findUnique({
      where: { id: newTenant.id },
      include: {
        property: true,
        leases: { orderBy: { startDate: "desc" }, take: 1 },
        moveRecords: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    return NextResponse.json(completeTenant, { status: 201 });
  } catch (error) {
    console.error("Error creating tenant:", error);
    return NextResponse.json(
      { message: "Failed to create tenant." },
      { status: 500 }
    );
  }
}