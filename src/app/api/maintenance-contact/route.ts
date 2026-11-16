import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const contacts = await prisma.maintenanceContact.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error fetching maintenance contacts:", error);
    return NextResponse.json(
      { message: "Failed to fetch maintenance contacts." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, serviceType, phone, email, rating, status, address, notes } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { message: "Name and phone are required." },
        { status: 400 }
      );
    }

    const contact = await prisma.maintenanceContact.create({
      data: {
        name,
        serviceType: serviceType || "Plumbing",
        phone,
        email: email || null,
        rating: rating || "5.0",
        status: status || "Available",
        address: address || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance contact:", error);
    return NextResponse.json(
      { message: "Failed to create maintenance contact." },
      { status: 500 }
    );
  }
}
