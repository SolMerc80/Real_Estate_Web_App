import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = Number(id);

    if (isNaN(clientId)) {
      return NextResponse.json({ message: "Invalid client ID." }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, phone, address, status, budget, propertyType } = body;

    const client = await prisma.client.update({
      where: { id: clientId },
      data: {
        name,
        email,
        phone,
        address,
        status,
        budget,
        propertyType,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json({ message: "Failed to update client." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = Number(id);

    if (isNaN(clientId)) {
      return NextResponse.json({ message: "Invalid client ID." }, { status: 400 });
    }

    await prisma.client.delete({
      where: { id: clientId },
    });

    return NextResponse.json({ message: "Client deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json({ message: "Failed to delete client." }, { status: 500 });
  }
}
