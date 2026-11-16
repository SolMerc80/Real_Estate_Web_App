import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { MaintenanceSchema } from "@/schemas/maintenance";

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        maintenanceJobs: {
          some: {}, // Only get properties that have maintenance jobs
        },
      },
      include: {
        maintenanceJobs: {
          include: {
            tenant: true,
            contractor: true,
          },
          orderBy: {
            reportedDate: "desc",
          },
        },
      },
      orderBy: { propertyName: "asc" },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching properties with maintenance jobs:", error);
    return NextResponse.json(
      { message: "Failed to fetch maintenance jobs." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validated = MaintenanceSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          message: "Validation failed.",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      propertyId,
      tenantId,
      contractorId,
      issueDescription,
      priority,
      status,
      reportedDate,
      invoiceDate,
      paymentDate,
      cost,
      paymentStatus,
      notes,
    } = validated.data;

    const job = await prisma.maintenance.create({
      data: {
        propertyId,
        tenantId: tenantId ?? null,
        contractorId: contractorId ?? null,
        issueDescription,
        priority,
        status,
        reportedDate: new Date(reportedDate),
        invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        cost: cost !== undefined && cost !== null ? cost : null,
        paymentStatus,
        notes: notes ?? null,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance job:", error);
    return NextResponse.json(
      { message: "Failed to create maintenance job." },
      { status: 500 }
    );
  }
}