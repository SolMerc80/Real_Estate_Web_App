import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q || q.length < 2) {
    return NextResponse.json({
      properties: [],
      maintenances: [],
      duePayments: [],
      tenants: [],
      landlords: [],
      contractors: [],
    });
  }

  const queryLower = q.toLowerCase();

  try {
    const [properties, maintenances, duePayments, tenants, landlords, contractors] = await Promise.all([
      // 1. Search Properties (by metadata or status string match like "available", "occupied", "maintenance")
      prisma.property.findMany({
        where: {
          OR: [
            { propertyName: { contains: q, mode: "insensitive" } },
            { propertyCode: { contains: q, mode: "insensitive" } },
            { address: { contains: q, mode: "insensitive" } },
            { suburb: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            // Status-driven keywords
            ...(queryLower.includes("avail") ? [{ status: "AVAILABLE" as const }] : []),
            ...(queryLower.includes("occup") ? [{ status: "OCCUPIED" as const }] : []),
            ...(queryLower.includes("maint") ? [{ status: "UNDER_MAINTENANCE" as const }] : []),
            ...(queryLower.includes("inact") ? [{ status: "INACTIVE" as const }] : []),
          ],
        },
        take: 5,
        select: {
          id: true,
          propertyName: true,
          propertyCode: true,
          address: true,
          city: true,
          status: true,
        },
      }),

      // 2. Search Maintenance Tickets & Progress (by issue description, priority, or status keywords like "in progress", "reported", "assigned", "urgent", "due")
      prisma.maintenance.findMany({
        where: {
          OR: [
            { issueDescription: { contains: q, mode: "insensitive" } },
            { property: { propertyName: { contains: q, mode: "insensitive" } } },
            { property: { propertyCode: { contains: q, mode: "insensitive" } } },
            ...(queryLower.includes("report") ? [{ status: "REPORTED" as const }] : []),
            ...(queryLower.includes("assign") ? [{ status: "ASSIGNED" as const }] : []),
            ...(queryLower.includes("prog") || queryLower.includes("pend") || queryLower.includes("maint") ? [{ status: "IN_PROGRESS" as const }] : []),
            ...(queryLower.includes("comp") || queryLower.includes("done") ? [{ status: "COMPLETED" as const }] : []),
            ...(queryLower.includes("urg") ? [{ priority: "URGENT" as const }] : []),
            ...(queryLower.includes("high") ? [{ priority: "HIGH" as const }] : []),
          ],
        },
        take: 5,
        select: {
          id: true,
          issueDescription: true,
          priority: true,
          status: true,
          property: {
            select: {
              propertyName: true,
              propertyCode: true,
            },
          },
        },
      }),

      // 3. Search Rent Payments / Due Rent (searching "due", "overdue", "rent", "pending", "unpaid", or tenant/property names)
      prisma.rentPayment.findMany({
        where: {
          OR: [
            { lease: { property: { propertyName: { contains: q, mode: "insensitive" } } } },
            { lease: { tenant: { firstName: { contains: q, mode: "insensitive" } } } },
            { lease: { tenant: { lastName: { contains: q, mode: "insensitive" } } } },
            ...(queryLower.includes("due") || queryLower.includes("overdue") || queryLower.includes("late") ? [{ status: "OVERDUE" as const }] : []),
            ...(queryLower.includes("pend") || queryLower.includes("rent") || queryLower.includes("unpaid") ? [{ status: "PENDING" as const }] : []),
            ...(queryLower.includes("part") ? [{ status: "PARTIAL" as const }] : []),
          ],
        },
        take: 5,
        select: {
          id: true,
          month: true,
          year: true,
          amountDue: true,
          status: true,
          lease: {
            select: {
              property: {
                select: {
                  propertyName: true,
                  propertyCode: true,
                },
              },
              tenant: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),

      // 4. Search Tenants
      prisma.tenant.findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phoneNumber: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          status: true,
        },
      }),

      // 5. Search Landlords
      prisma.landlord.findMany({
        where: {
          OR: [
            { displayName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phoneNumber: { contains: q, mode: "insensitive" } },
            { properties: { some: { propertyCode: { contains: q, mode: "insensitive" } } } },
            { properties: { some: { propertyName: { contains: q, mode: "insensitive" } } } },
          ],
        },
        take: 5,
        select: {
          id: true,
          displayName: true,
          email: true,
          phoneNumber: true,
          commissionRate: true,
        },
      }),

      // 6. Search Contractors
      prisma.contractor.findMany({
        where: {
          OR: [
            { contractorName: { contains: q, mode: "insensitive" } },
            { speciality: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: {
          id: true,
          contractorName: true,
          speciality: true,
        },
      }),
    ]);

    const formattedDuePayments = duePayments.map((p) => ({
      ...p,
      amountDue: p.amountDue ? p.amountDue.toString() : "0.00",
    }));

    return NextResponse.json({
      properties,
      maintenances,
      duePayments: formattedDuePayments,
      tenants,
      landlords,
      contractors,
    });
  } catch (error) {
    console.error("Global search API error:", error);
    return NextResponse.json(
      { error: "Failed to perform global search" },
      { status: 500 }
    );
  }
}
