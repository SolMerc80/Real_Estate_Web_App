import { z } from "zod";

export const MaintenanceContactSchema = z.object({
  name: z.string().trim().min(1, "Contact name is required"),
  serviceType: z.string().trim().min(1, "Service type is required"),
  phone: z.string().trim().min(1, "Phone number is required"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal(""))
    .nullable(),
  rating: z.string().trim().default("5.0"),
  status: z.string().trim().default("Available"),
  address: z.string().trim().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const MaintenanceContactUpdateSchema = MaintenanceContactSchema.partial();

