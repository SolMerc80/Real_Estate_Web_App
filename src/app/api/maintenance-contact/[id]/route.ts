import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contactId = Number(id);

    if (isNaN(contactId)) {
      return NextResponse.json({ message: "Invalid contact ID." }, { status: 400 });
    }

    const body = await request.json();
    const { name, serviceType, phone, email, rating, status, address, notes } = body;

    const contact = await prisma.maintenanceContact.update({
      where: { id: contactId },
      data: {
        name,
        serviceType,
        phone,
        email,
        rating,
        status,
        address,
        notes,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error updating maintenance contact:", error);
    return NextResponse.json({ message: "Failed to update maintenance contact." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contactId = Number(id);

    if (isNaN(contactId)) {
      return NextResponse.json({ message: "Invalid contact ID." }, { status: 400 });
    }

    await prisma.maintenanceContact.delete({
      where: { id: contactId },
    });

    return NextResponse.json({ message: "Maintenance contact deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting maintenance contact:", error);
    return NextResponse.json({ message: "Failed to delete maintenance contact." }, { status: 500 });
  }
}
