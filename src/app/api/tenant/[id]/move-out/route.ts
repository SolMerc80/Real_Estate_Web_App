import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { TenantMoveOutSchema } from "@/schemas/tenant";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = Number(id);

    if (isNaN(tenantId) || tenantId <= 0) {
      return NextResponse.json({ message: "Invalid tenant ID." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const validated = TenantMoveOutSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          message: "Validation failed.",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { moveOutDate, moveOutNotes, updatePropertyStatus } = validated.data;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { property: true },
    });

    if (!tenant) {
      return NextResponse.json({ message: "Tenant not found." }, { status: 404 });
    }

    const outDate = moveOutDate ? new Date(moveOutDate) : new Date();

    // 1. Update Tenant status to PREVIOUS
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        status: "PREVIOUS",
        notes: moveOutNotes
          ? `${tenant.notes ? tenant.notes + "\n" : ""}[Move-Out ${outDate.toISOString().split("T")[0]}]: ${moveOutNotes}`
          : tenant.notes,
      },
    });

    // 2. Terminate active leases
    await prisma.lease.updateMany({
      where: { tenantId, status: "ACTIVE" },
      data: { status: "TERMINATED" },
    });

    // 3. Update or create MoveRecord
    const existingMove = await prisma.moveRecord.findFirst({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    if (existingMove) {
      await prisma.moveRecord.update({
        where: { id: existingMove.id },
        data: {
          moveOutDate: outDate,
          notes: moveOutNotes || existingMove.notes,
        },
      });
    } else {
      await prisma.moveRecord.create({
        data: {
          tenantId,
          propertyId: tenant.propertyId,
          moveInDate: tenant.createdAt,
          moveOutDate: outDate,
          notes: moveOutNotes || null,
        },
      });
    }

    // 4. Update property status to AVAILABLE if requested and no other active tenants remain
    if (updatePropertyStatus) {
      const activeCount = await prisma.tenant.count({
        where: { propertyId: tenant.propertyId, status: "ACTIVE", NOT: { id: tenantId } },
      });
      if (activeCount === 0) {
        await prisma.property.update({
          where: { id: tenant.propertyId },
          data: { status: "AVAILABLE" },
        });
      }
    }

    const updated = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        property: true,
        leases: { orderBy: { startDate: "desc" }, take: 1 },
        moveRecords: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Move out error:", error);
    return NextResponse.json({ message: "Failed to record move out." }, { status: 500 });
  }
}