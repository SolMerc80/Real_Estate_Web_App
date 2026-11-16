import { z } from "zod";

export const TenantSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  propertyId: z.coerce.number().int().positive("A valid property must be selected"),
  phoneNumber: z.string().trim().optional().nullable(),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal(""))
    .nullable(),
  status: z.enum(["ACTIVE", "PREVIOUS"]).default("ACTIVE"),
  notes: z.string().optional().nullable(),

  // Optional fields sent during tenant onboarding for initial lease / move records
  monthlyRent: z.coerce.number().nonnegative().optional().nullable(),
  leaseStartDate: z.string().optional().nullable(),
  leaseEndDate: z.string().optional().nullable(),
  moveInDate: z.string().optional().nullable(),
  moveOutDate: z.string().optional().nullable(),
});

export const TenantUpdateSchema = TenantSchema.partial();

export const TenantMoveOutSchema = z.object({
  moveOutDate: z.string().optional().nullable(),
  moveOutNotes: z.string().optional().nullable(),
  updatePropertyStatus: z.boolean().default(true),
});

