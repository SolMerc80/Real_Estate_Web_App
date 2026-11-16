import { z } from "zod";

export const ClientSchema = z.object({
  name: z.string().trim().min(1, "Client name is required"),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().min(1, "Phone number is required"),
  address: z.string().trim().optional().nullable(),
  status: z.string().trim().default("Lead"),
  budget: z.string().trim().optional().nullable(),
  propertyType: z.string().trim().default("House"),
});

export const ClientUpdateSchema = ClientSchema.partial();

