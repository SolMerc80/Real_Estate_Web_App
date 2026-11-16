import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { message: "Failed to fetch clients." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, status, budget, propertyType } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { message: "Name, email, and phone are required." },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address: address || null,
        status: status || "Lead",
        budget: budget || null,
        propertyType: propertyType || "House",
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { message: "Failed to create client." },
      { status: 500 }
    );
  }
}
