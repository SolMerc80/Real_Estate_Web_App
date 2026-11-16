import { z } from "zod";

export const LandlordSchema = z.object({
  displayName: z
    .string()
    .min(1, "Landlord name is required"),
  phoneNumber: z.string().optional().nullable(),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal(""))
    .nullable(),
  commissionRate: z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    }),
  notes: z.string().optional().nullable(),
  propertyId: z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val === "") return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    }),
  managingAgent: z.string().optional().nullable(),
});

export const LandlordUpdateSchema = LandlordSchema.partial();
