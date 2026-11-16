import { z } from "zod";

export const PropertySchema = z.object({
    propertyCode: z
        .string()
        .min(1, "Property code is required"),

    propertyName: z
        .string()
        .min(1, "Property name is required"),

    address: z
        .string()
        .min(5, "Address must be at least 5 characters"),
    
    suburb: z.string().optional(),

    city: z.string().optional(),

    province: z.string().optional(),

    postalCode: z.string().optional(),

    propertyType: z.enum([
        "HOUSE",
        "APARTMENT",
        "TOWNHOUSE",
        "COMMERCIAL",
        "OFFICE",
        "LAND",
        "OTHER",
    ]),

    status: z.enum([
        "AVAILABLE",
        "OCCUPIED",
        "UNDER_MAINTENANCE",
        "INACTIVE",
    ]).optional(),

    landlordId: z.number().nullable().optional(),

    parentPropertyId: z.number().nullable().optional(),

    notes: z.string().optional(),
});

export const PropertyUpdateSchema = z.object({
    propertyCode: z.string().min(1),
    propertyName: z.string().min(1),
    price: z.coerce.number().positive(),
    address: z.string().min(1),
    city: z.string().min(1),
    propertyType: z.enum([
        "HOUSE",
        "APARTMENT",
        "TOWNHOUSE",
        "COMMERCIAL",
        "OFFICE",
        "LAND",
        "OTHER",
    ]),
    status: z.enum([
        "AVAILABLE",
        "OCCUPIED",
        "UNDER_MAINTENANCE",
        "INACTIVE",
    ]),
    notes: z.string().optional(),
}).partial();