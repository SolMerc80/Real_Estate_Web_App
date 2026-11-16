import { z } from "zod";

export const LeaseSchema = z
  .object({
    propertyId: z.coerce.number().int().positive("A valid property must be selected"),
    tenantId: z.coerce.number().int().positive("A valid tenant must be selected"),
    startDate: z.string().min(1, "Start date is required").refine((val) => !isNaN(Date.parse(val)), {
      message: "Start date must be a valid date",
    }),
    endDate: z.string().min(1, "End date is required").refine((val) => !isNaN(Date.parse(val)), {
      message: "End date must be a valid date",
    }),
    monthlyRent: z.coerce.number().positive("Monthly rent must be greater than zero"),
    depositHeld: z.coerce.number().nonnegative("Deposit cannot be negative").optional().nullable(),
    status: z
      .enum(["ACTIVE", "EXPIRED", "CRITICAL", "EXPIRING_SOON", "TERMINATED"])
      .default("ACTIVE"),
    leaseReference: z.string().trim().optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate).getTime();
      const end = new Date(data.endDate).getTime();
      return end >= start;
    },
    {
      message: "Lease end date cannot be earlier than start date",
      path: ["endDate"],
    }
  );

export const LeaseUpdateSchema = z.object({
  propertyId: z.coerce.number().int().positive().optional(),
  tenantId: z.coerce.number().int().positive().optional(),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start date" })
    .optional(),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid end date" })
    .optional(),
  monthlyRent: z.coerce.number().positive().optional(),
  depositHeld: z.coerce.number().nonnegative().optional().nullable(),
  status: z.enum(["ACTIVE", "EXPIRED", "CRITICAL", "EXPIRING_SOON", "TERMINATED"]).optional(),
  renewalDate: z.string().optional().nullable(),
  leaseReference: z.string().optional().nullable(),
});

