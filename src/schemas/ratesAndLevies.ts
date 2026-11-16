import { z } from "zod";

export const RatesAndLevyAccountSchema = z.object({
  propertyId: z.coerce.number().int().positive("A valid property must be selected"),
  accountName: z.string().trim().min(1, "Account or provider name is required"),
  accountNumber: z.string().trim().optional().nullable(),
  notes: z.string().optional().nullable(),

  // Optional initial entry fields
  amount: z.coerce.number().nonnegative("Amount cannot be negative").optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  dueDate: z.string().optional().nullable(),
  paid: z.boolean().default(false),
});

export const RatesAndLevyEntrySchema = z.object({
  ratesAndLevyId: z.coerce.number().int().positive("A valid account must be selected"),
  month: z.coerce.number().int().min(1, "Month must be 1-12").max(12, "Month must be 1-12"),
  year: z.coerce.number().int().min(2000).max(2100),
  amount: z.coerce.number().nonnegative("Amount must be zero or positive"),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: "Invalid due date" }),
  paid: z.boolean().default(false),
  paidDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: "Invalid paid date" }),
});

export const RatesAndLevyUpdateSchema = z.object({
  accountName: z.string().trim().min(1).optional(),
  accountNumber: z.string().trim().optional().nullable(),
  amount: z.coerce.number().nonnegative().optional(),
  dueDate: z.string().optional().nullable(),
  paid: z.boolean().optional(),
  paidDate: z.string().optional().nullable(),
  togglePaid: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

