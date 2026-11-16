import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { ContractorUpdateSchema } from "@/schemas/contractor";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await params;
        const id = Number(paramId);

        if(isNaN(id) || id <= 0) {
            return NextResponse.json({ message: "Invalid contractor ID." }, { status: 400 });
        }

        const body = await request.json();
        const validated = ContractorUpdateSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                {
                    message: "Validation failed.",
                    errors: validated.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const contractor = await prisma.contractor.update({
            where: { id },
            data: validated.data,
        });

        return NextResponse.json(contractor);
    } catch (error) {
        console.error("Error updating contractor:", error);
        return NextResponse.json(
            { message: "Failed to update contractor." },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await params;
        const id = Number(paramId);
        
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ message: "Invalid contractor ID."}, { status: 400 });
        }

        await prisma.contractor.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Contractor deleted successfully."});
    } catch (error) {
        console.error("Error deleting contractor.", error);
        return NextResponse.json(
            { message: "Failed to delete contractor." },
            { status: 500 }
        );
    }
}