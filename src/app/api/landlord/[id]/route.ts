import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { LandlordUpdateSchema } from "@/schemas/landlord";

// GET SINGLE LANDLORD
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const landlordId = Number(id);

    if (isNaN(landlordId)) {
      return NextResponse.json({ message: "Invalid landlord ID." }, { status: 400 });
    }

    const landlord = await prisma.landlord.findUnique({
      where: { id: landlordId },
      include: {
        properties: {
          select: {
            id: true,
            propertyCode: true,
            propertyName: true,
            address: true,
            suburb: true,
            city: true,
            status: true,
            price: true,
            managingAgent: true,
            notes: true,
          },
        },
      },
    });

    if (!landlord) {
      return NextResponse.json({ message: "Landlord not found." }, { status: 404 });
    }

    return NextResponse.json({
      ...landlord,
      commissionRate: landlord.commissionRate ? Number(landlord.commissionRate) : null,
      properties: landlord.properties.map((p) => ({
        ...p,
        price: p.price ? Number(p.price) : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching landlord:", error);
    return NextResponse.json({ message: "Failed to fetch landlord." }, { status: 500 });
  }
}

// UPDATE LANDLORD
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const landlordId = Number(id);

    if (isNaN(landlordId)) {
      return NextResponse.json({ message: "Invalid landlord ID." }, { status: 400 });
    }

    const body = await request.json();
    const validated = LandlordUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          message: "Validation failed.",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { displayName, phoneNumber, email, commissionRate, notes, propertyId, managingAgent } = validated.data;

    const updatedLandlord = await prisma.landlord.update({
      where: { id: landlordId },
      data: {
        ...(displayName !== undefined ? { displayName } : {}),
        ...(phoneNumber !== undefined ? { phoneNumber: phoneNumber || null } : {}),
        ...(email !== undefined ? { email: email || null } : {}),
        ...(commissionRate !== undefined ? { commissionRate: commissionRate !== null ? commissionRate : null } : {}),
        ...(notes !== undefined ? { notes: notes || null } : {}),
      },
    });

    // Handle property linkage & managingAgent
    if (propertyId !== undefined) {
      if (propertyId) {
        // Link property to this landlord
        await prisma.property.update({
          where: { id: propertyId },
          data: {
            landlordId,
            ...(managingAgent ? { managingAgent } : {}),
          },
        });
      }
    } else if (managingAgent) {
      // If landlord has an existing property, update its managing agent
      await prisma.property.updateMany({
        where: { landlordId },
        data: { managingAgent },
      });
    }

    const fullLandlord = await prisma.landlord.findUnique({
      where: { id: landlordId },
      include: {
        properties: true,
      },
    });

    return NextResponse.json(fullLandlord);
  } catch (error: unknown) {
    console.error("Error updating landlord:", error);
    const err = error as { code?: string; message?: string };
    if (err.code === "P2002") {
      return NextResponse.json(
        { message: "A landlord with this email address already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: "Failed to update landlord." }, { status: 500 });
  }
}

// DELETE LANDLORD
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const landlordId = Number(id);

    if (isNaN(landlordId)) {
      return NextResponse.json({ message: "Invalid landlord ID." }, { status: 400 });
    }

    // Disconnect properties first so properties are not deleted or orphaned with invalid FK
    await prisma.property.updateMany({
      where: { landlordId },
      data: { landlordId: null },
    });

    await prisma.landlord.delete({
      where: { id: landlordId },
    });

    return NextResponse.json({ message: "Landlord deleted successfully." });
  } catch (error) {
    console.error("Error deleting landlord:", error);
    return NextResponse.json({ message: "Failed to delete landlord." }, { status: 500 });
  }
}
