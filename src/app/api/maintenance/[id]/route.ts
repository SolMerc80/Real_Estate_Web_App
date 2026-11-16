import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { MaintenanceUpdateSchema } from "@/schemas/maintenance";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await params;
        const id = Number(paramId);

        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ message: "Invalid maintenance job ID." }, { status: 400 });
        }

        const body = await request.json();
        const validated = MaintenanceUpdateSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                {
                    message: "Validation failed.",
                    errors: validated.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const data: Record<string, unknown> = { ...validated.data };
        if (data.reportedDate) data.reportedDate = new Date(data.reportedDate as string);
        if (data.invoiceDate !== undefined) data.invoiceDate = data.invoiceDate ? new Date(data.invoiceDate as string) : null;
        if (data.paymentDate !== undefined) data.paymentDate = data.paymentDate ? new Date(data.paymentDate as string) : null;

        const job = await prisma.maintenance.update({
            where: { id },
            data,
        });

        return NextResponse.json(job);
    } catch (error) {
        console.error("Error updating maintenance job:", error);
        return NextResponse.json(
            { message: "Failed to update maintenance job." },
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
            return NextResponse.json({ message: "Invalid maintenance job ID." }, { status: 400 });
        }

        await prisma.maintenance.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Maintenance job deleted successfully." });
    } catch (error) {
        console.error("Error deleting maintenance job:", error);
        return NextResponse.json(
            { message: "Failed to delete maintenance job." },
            { status: 500 }
        );
    }
}