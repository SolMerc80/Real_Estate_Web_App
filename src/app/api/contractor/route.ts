import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { ContractorSchema } from "@/schemas/contractor";

export async function GET() {
    try {
        const contractors = await prisma.contractor.findMany({
            orderBy: { contractorName: "asc" }, 
        });

        return NextResponse.json(contractors);
    } catch (error) {
        console.error("Error fetching contractors:", error);
        return NextResponse.json(
            { message: "Failed to fetch contractors." },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request body against Zod schema
        const validated = ContractorSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({
                message: "Validation failed.",
                errors: validated.error.flatten().fieldErrors
            },
        { status: 400 });
        }

         const contractor = await prisma.contractor.create({
         data: validated.data,
    });

    return NextResponse.json(contractor, { status: 201 });
    } catch (error) {
        console.error("Error creating contractor:", error);
        return NextResponse.json(
            { message: "Failed to create contractor." },
            { status: 500 }
        );
    }
}