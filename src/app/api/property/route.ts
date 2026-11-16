import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { PropertySchema } from "@/schemas/property";

// GET ALL PROPERTIES
export async function GET() {
    try {
        const properties = await prisma.property.findMany({
            include: {
                landlord: true,
                parentProperty: {
                    select: {
                        id: true,
                        propertyCode: true,
                        propertyName: true,
                    },
                },
                childProperties: {
                    select: {
                        id: true,
                        propertyCode: true,
                        propertyName: true,
                        status: true,
                        price: true,
                    },
                },
                _count: {
                    select: {
                        tenants: true,
                        leases: true,
                        maintenanceJobs: true,
                    },
                },
            },
            orderBy: { propertyCode: 'asc' }
        });

        return NextResponse.json(properties);
    } catch (error) {
        console.error("Error fetching properties:", error);
        return NextResponse.json(
            { message: "Failed to fetch properties." },
            { status: 500 }
        );
    }
}

// CREATE A PROPERTY
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validated = PropertySchema.safeParse(body);

        if(!validated.success) {
            return NextResponse.json(
                {
                    message: "Validation failed.",
                    errors: validated.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const property = await prisma.property.create({
            data: validated.data,
        });

        return NextResponse.json(property, { status: 201 });
    } catch (error) {
        console.error("Error creating property:", error);
        return NextResponse.json(
            { message: "Failed to create property." },
            { status: 500 }
        );
    }
}

// UPDATE A PROPERTY


{/*
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PropertySchema } from "@/schemas/property";

export async function GET() {
    try {
        const properties = await prisma.property.findMany({
            include: {
                landlord: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(properties);
    } catch (error) {
        console.error("Error fetching properties:", error);

        return NextResponse.json(
            { message: "Failed to fetch properties." },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = PropertySchema.safeParse(body);

        if(!validated.success) {
            return NextResponse.json(
                {
                    message: "Validated failed",
                    errors: validated.error.flatten().fieldErrors,
                },
                {
                    status: 400,
                }
            );
        }

        const property = await prisma.property.create({
            data: {
                propertyCode: validated.data.propertyCode,
                propertyName: validated.data.propertyName,
                address: validated.data.address,
                suburb: validated.data.suburb,
                city: validated.data.city,
                province: validated.data.province,
                postalCode: validated.data.postalCode,
                propertyType: validated.data.propertyType,
                status: validated.data.status,
                notes: validated.data.notes,
                landlordId: validated.data.landlordId ?? null,
                parentPropertyId: validated.data.parentPropertyId ?? null,
            },
        });

        return NextResponse.json(property, { status: 201 });
    } catch (error) {
        console.error("Error creating property:", error);

        return NextResponse.json(
            { message: "Failed to create property." },
            { status: 500 } 
        );
    }
} */}