import { z } from "zod";

export const RentPaymentSchema = z.object({
  leaseId: z.coerce.number().int().positive("A valid lease must be selected"),
  month: z.coerce.number().int().min(1, "Month must be between 1 and 12").max(12, "Month must be between 1 and 12"),
  year: z.coerce.number().int().min(2000, "Year must be 2000 or later").max(2100, "Invalid year"),
  amountDue: z.coerce.number().nonnegative("Amount due must be zero or positive"),
  amountPaid: z.coerce.number().nonnegative("Amount paid cannot be negative").default(0),
  paymentDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Payment date must be a valid date",
    }),
  status: z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE"]).default("PENDING"),
  notes: z.string().optional().nullable(),
});

export const RentPaymentUpdateSchema = z.object({
  amountDue: z.coerce.number().nonnegative().optional(),
  amountPaid: z.coerce.number().nonnegative().optional(),
  paymentDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Payment date must be a valid date",
    }),
  status: z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE"]).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  notes: z.string().optional().nullable(),
  toggleStatus: z.boolean().optional(),
});

