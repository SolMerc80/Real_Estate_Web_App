import { z } from "zod";

export const MaintenanceSchema = z.object({
  propertyId: z.coerce.number().int().positive("A valid property must be selected"),
  tenantId: z.coerce.number().int().positive().optional().nullable(),
  contractorId: z.coerce.number().int().positive().optional().nullable(),
  issueDescription: z.string().trim().min(1, "Issue description is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["REPORTED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("REPORTED"),
  reportedDate: z
    .string()
    .min(1, "Reported date is required")
    .refine((val) => !isNaN(Date.parse(val)), { message: "Reported date must be a valid date" }),
  invoiceDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: "Invoice date must be a valid date" }),
  paymentDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: "Payment date must be a valid date" }),
  cost: z.coerce.number().nonnegative("Cost cannot be negative").optional().nullable(),
  paymentStatus: z.enum(["UNPAID", "PAID"]).default("UNPAID"),
  notes: z.string().optional().nullable(),
});

export const MaintenanceUpdateSchema = MaintenanceSchema.partial();

