import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { LandlordSchema } from "@/schemas/landlord";

// GET ALL LANDLORDS
export async function GET() {
  try {
    const landlords = await prisma.landlord.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    const formattedLandlords = landlords.map((landlord) => ({
      ...landlord,
      commissionRate: landlord.commissionRate ? Number(landlord.commissionRate) : null,
      properties: landlord.properties.map((p) => ({
        ...p,
        price: p.price ? Number(p.price) : null,
      })),
    }));

    return NextResponse.json(formattedLandlords);
  } catch (error) {
    console.error("Error fetching landlords:", error);
    return NextResponse.json(
      { message: "Failed to fetch landlords." },
      { status: 500 }
    );
  }
}

// CREATE A LANDLORD
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = LandlordSchema.safeParse(body);

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

    const landlord = await prisma.landlord.create({
      data: {
        displayName,
        phoneNumber: phoneNumber || null,
        email: email || null,
        commissionRate: commissionRate !== null && commissionRate !== undefined ? commissionRate : null,
        notes: notes || null,
      },
    });

    // If a property was assigned, link it to this landlord and update its managing agent
    if (propertyId) {
      await prisma.property.update({
        where: { id: propertyId },
        data: {
          landlordId: landlord.id,
          ...(managingAgent ? { managingAgent } : {}),
        },
      });
    }

    // Return the created landlord with its properties
    const createdLandlord = await prisma.landlord.findUnique({
      where: { id: landlord.id },
      include: {
        properties: true,
      },
    });

    return NextResponse.json(createdLandlord, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating landlord:", error);
    const err = error as { code?: string; message?: string };
    if (err.code === "P2002") {
      return NextResponse.json(
        { message: "A landlord with this email address already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create landlord." },
      { status: 500 }
    );
  }
}
