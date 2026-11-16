import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { PropertyUpdateSchema } from "@/schemas/property";

//////////////////////////////////////////////////////
// GET A SINGLE PROPERTY
//////////////////////////////////////////////////////

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const propertyId = Number(id);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { message: "Invalid property ID." },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: {
        id: propertyId,
      },
      include: {
        landlord: true,
        _count: {
          select: {
            tenants: true,
            leases: true,
            maintenanceJobs: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { message: "Property not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(property);

  } catch (error) {
    console.error("Error fetching property:", error);

    return NextResponse.json(
      { message: "Failed to fetch property." },
      { status: 500 }
    );
  }
}

//////////////////////////////////////////////////////
// UPDATE A PROPERTY
//////////////////////////////////////////////////////

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise< { id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = Number(id);

    if (isNaN(propertyId)) {
      return NextResponse.json({ message: "Invalid property ID."}, { status: 400 });
    }

    const body = await request.json();

    const validated = PropertyUpdateSchema.partial().safeParse(body);

    if (!validated.success) {
      console.log("Zod errors:", validated.error.flatten().fieldErrors);
      return NextResponse.json(
        { message: "Validation failed.", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = { ...validated.data } as Record<string, unknown>;
    delete data.landlord;
    delete data._count;

    if (data.landlordId !== undefined) data.landlordId = data.landlordId ? Number(data.landlordId) : null;
    if (data.parentPropertyId !== undefined) data.parentPropertyId = data.parentPropertyId ? Number(data.parentPropertyId) : null;

    const property = await prisma.property.update({
      where: { id: propertyId },
      data,
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json({ message: "Failed to update property." }, { status: 500 });
  }
}

{/* export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const propertyId = Number(id);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { message: "Invalid property ID." },
        { status: 400 }
      );
    }

    const existingProperty = await prisma.property.findUnique({
      where: {
        id: propertyId,
      },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { message: "Property not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const validated = PropertySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          message: "Validation failed.",
          errors: validated.error.flatten().fieldErrors,
        },
        {
          status: 400,
        }
      );
    }

    const property = await prisma.property.update({
      where: {
        id: propertyId,
      },
      data: validated.data,
    });

    return NextResponse.json(property);

  } catch (error) {
    console.error("Error updating property:", error);

    return NextResponse.json(
      { message: "Failed to update property." },
      { status: 500 }
    );
  }
} */}

//////////////////////////////////////////////////////
// DELETE A PROPERTY
//////////////////////////////////////////////////////

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const propertyId = Number(id);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { message: "Invalid property ID." },
        { status: 400 }
      );
    }

    const existingProperty = await prisma.property.findUnique({
      where: {
        id: propertyId,
      },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { message: "Property not found." },
        { status: 404 }
      );
    }

    // Delete all related records in a transaction to satisfy foreign key
    // constraints. Order matters: deepest dependents first.
    await prisma.$transaction(async (tx) => {
      // 1. Rent payments belong to leases that belong to this property
      await tx.rentPayment.deleteMany({
        where: { lease: { propertyId } },
      });

      // 2. Leases
      await tx.lease.deleteMany({ where: { propertyId } });

      // 3. Maintenance jobs
      await tx.maintenance.deleteMany({ where: { propertyId } });

      // 4. Rates & levy entries (child of RatesAndLevy)
      await tx.ratesAndLevyEntry.deleteMany({
        where: { ratesAndLevy: { propertyId } },
      });

      // 5. Rates & levy accounts
      await tx.ratesAndLevy.deleteMany({ where: { propertyId } });

      // 6. Move records
      await tx.moveRecord.deleteMany({ where: { propertyId } });

      // 7. Property documents
      await tx.propertyDocument.deleteMany({ where: { propertyId } });

      // 8. Tenants
      await tx.tenant.deleteMany({ where: { propertyId } });

      // 9. Detach child properties (don't delete them, just unlink)
      await tx.property.updateMany({
        where: { parentPropertyId: propertyId },
        data: { parentPropertyId: null },
      });

      // 10. Finally, delete the property itself
      await tx.property.delete({ where: { id: propertyId } });
    });

    return NextResponse.json(
      { message: "Property deleted successfully." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting property:", error);

    return NextResponse.json(
      { message: "Failed to delete property." },
      { status: 500 }
    );
  }
}