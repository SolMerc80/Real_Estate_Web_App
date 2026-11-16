import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { TenantUpdateSchema } from "@/schemas/tenant";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = Number(id);

    if (isNaN(tenantId) || tenantId <= 0) {
      return NextResponse.json({ message: "Invalid tenant ID." }, { status: 400 });
    }

    const body = await request.json();
    const validated = TenantUpdateSchema.safeParse(body);

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

    const existingTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!existingTenant) {
      return NextResponse.json({ message: "Tenant not found." }, { status: 404 });
    }

    const targetPropertyId = propertyId ?? existingTenant.propertyId;
    const tenantStatus = status ?? existingTenant.status;

    // Update tenant primary info
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(phoneNumber !== undefined ? { phoneNumber: phoneNumber || null } : {}),
        ...(email !== undefined ? { email: email || null } : {}),
        ...(propertyId !== undefined ? { propertyId } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(notes !== undefined ? { notes: notes || null } : {}),
      },
    });

    // Update or create lease if dates provided
    if (leaseStartDate && leaseEndDate) {
      const existingLease = await prisma.lease.findFirst({
        where: { tenantId },
        orderBy: { startDate: "desc" },
      });

      if (existingLease) {
        await prisma.lease.update({
          where: { id: existingLease.id },
          data: {
            propertyId: targetPropertyId,
            startDate: new Date(leaseStartDate),
            endDate: new Date(leaseEndDate),
            monthlyRent: monthlyRent ?? existingLease.monthlyRent,
            status: tenantStatus === "ACTIVE" ? "ACTIVE" : "TERMINATED",
          },
        });
      } else {
        await prisma.lease.create({
          data: {
            tenantId,
            propertyId: targetPropertyId,
            startDate: new Date(leaseStartDate),
            endDate: new Date(leaseEndDate),
            monthlyRent: monthlyRent ?? 0,
            status: tenantStatus === "ACTIVE" ? "ACTIVE" : "TERMINATED",
          },
        });
      }
    }

    // Update or create MoveRecord
    if (moveInDate || moveOutDate || notes) {
      const existingMove = await prisma.moveRecord.findFirst({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
      });

      if (existingMove) {
        await prisma.moveRecord.update({
          where: { id: existingMove.id },
          data: {
            propertyId: targetPropertyId,
            moveInDate: moveInDate ? new Date(moveInDate) : existingMove.moveInDate,
            moveOutDate: moveOutDate ? new Date(moveOutDate) : existingMove.moveOutDate,
            notes: notes || existingMove.notes,
          },
        });
      } else {
        await prisma.moveRecord.create({
          data: {
            tenantId,
            propertyId: targetPropertyId,
            moveInDate: moveInDate ? new Date(moveInDate) : new Date(),
            moveOutDate: moveOutDate ? new Date(moveOutDate) : null,
            notes: notes || null,
          },
        });
      }
    }

    // Update property occupancy status
    const isMoveOutPastOrToday = moveOutDate
      ? new Date(moveOutDate).getTime() <= new Date().setHours(23, 59, 59, 999)
      : false;

    if (tenantStatus === "PREVIOUS" || (moveOutDate && isMoveOutPastOrToday)) {
      const otherActiveTenants = await prisma.tenant.count({
        where: { propertyId: targetPropertyId, status: "ACTIVE", NOT: { id: tenantId } },
      });
      if (otherActiveTenants === 0) {
        await prisma.property.update({
          where: { id: targetPropertyId },
          data: { status: "AVAILABLE" },
        });
      }
    } else if (tenantStatus === "ACTIVE") {
      await prisma.property.update({
        where: { id: targetPropertyId },
        data: { status: "OCCUPIED" },
      });
    }

    const completeTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        property: true,
        leases: { orderBy: { startDate: "desc" }, take: 1 },
        moveRecords: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return NextResponse.json(completeTenant);
  } catch (error) {
    console.error("Error updating tenant:", error);
    return NextResponse.json({ message: "Failed to update tenant." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = Number(id);

    if (isNaN(tenantId) || tenantId <= 0) {
      return NextResponse.json({ message: "Invalid tenant ID." }, { status: 400 });
    }

    // Delete dependent move records, leases, maintenances first
    await prisma.moveRecord.deleteMany({ where: { tenantId } });
    await prisma.lease.deleteMany({ where: { tenantId } });
    await prisma.tenant.delete({ where: { id: tenantId } });

    return NextResponse.json({ message: "Tenant deleted successfully." });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    return NextResponse.json({ message: "Failed to delete tenant." }, { status: 500 });
  }
}