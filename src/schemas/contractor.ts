import { z } from "zod";

export const ContractorSchema = z.object({
  contractorName: z.string().trim().min(1, "Contractor name is required"),
  speciality: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  beneficiaryNumber: z.string().trim().optional().nullable(),
  phoneNumber: z.string().trim().optional().nullable(),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal(""))
    .nullable(),
  notes: z.string().optional().nullable(),
});

export const ContractorUpdateSchema = ContractorSchema.partial();

