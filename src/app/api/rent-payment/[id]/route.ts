import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { RentPaymentUpdateSchema } from "@/schemas/rentPayment";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const paymentId = Number(id);

    if (isNaN(paymentId) || paymentId <= 0) {
      return NextResponse.json({ message: "Invalid payment ID." }, { status: 400 });
    }

    const body = await request.json();
    const validated = RentPaymentUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          message: "Validation failed.",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.rentPayment.findUnique({
      where: { id: paymentId },
    });

    if (!existing) {
      return NextResponse.json({ message: "Rent payment record not found." }, { status: 404 });
    }

    const {
      amountDue,
      amountPaid,
      paymentDate,
      status,
      notes,
      month,
      year,
      toggleStatus,
    } = validated.data;

    let updatedStatus = existing.status;
    let updatedPaid = existing.amountPaid !== null ? Number(existing.amountPaid) : 0;
    let updatedDue = existing.amountDue ? Number(existing.amountDue) : 0;
    let updatedPaymentDate = existing.paymentDate;

    if (amountDue !== undefined) {
      updatedDue = amountDue;
    }

    if (toggleStatus !== undefined) {
      if (existing.status === "PAID") {
        updatedStatus = "PENDING";
        updatedPaid = 0;
        updatedPaymentDate = null;
      } else {
        updatedStatus = "PAID";
        updatedPaid = updatedDue;
        updatedPaymentDate = new Date();
      }
    } else {
      if (amountPaid !== undefined) {
        updatedPaid = amountPaid;
      }

      if (status !== undefined) {
        if (status === "PAID") {
          updatedStatus = "PAID";
          if (updatedPaid === 0 && updatedDue > 0) {
            updatedPaid = updatedDue;
          }
          if (!updatedPaymentDate && !paymentDate) {
            updatedPaymentDate = new Date();
          }
        } else if (status === "PENDING" || status === "OVERDUE") {
          updatedStatus = status;
          updatedPaid = 0;
          updatedPaymentDate = null;
        } else {
          updatedStatus = status;
        }
      }

      if (paymentDate !== undefined) {
        updatedPaymentDate = paymentDate ? new Date(paymentDate) : null;
      }
    }

    const updated = await prisma.rentPayment.update({
      where: { id: paymentId },
      data: {
        amountDue: updatedDue,
        amountPaid: updatedPaid,
        status: updatedStatus,
        paymentDate: updatedPaymentDate,
        ...(notes !== undefined ? { notes } : {}),
        ...(month !== undefined ? { month } : {}),
        ...(year !== undefined ? { year } : {}),
      },
      include: {
        lease: {
          include: {
            property: true,
            tenant: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating rent payment:", error);
    return NextResponse.json(
      { message: "Failed to update rent payment." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const paymentId = Number(id);

    if (isNaN(paymentId) || paymentId <= 0) {
      return NextResponse.json({ message: "Invalid payment ID." }, { status: 400 });
    }

    await prisma.rentPayment.delete({
      where: { id: paymentId },
    });

    return NextResponse.json({ message: "Rent payment deleted successfully." });
  } catch (error) {
    console.error("Error deleting rent payment:", error);
    return NextResponse.json(
      { message: "Failed to delete rent payment." },
      { status: 500 }
    );
  }
}