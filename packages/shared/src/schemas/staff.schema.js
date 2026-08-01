import { z } from "zod";

export const createStaffSchema = z.object({
  firstName: z
    .string({ error: "firstName is required." })
    .trim()
    .min(1, "firstName is required.")
    .max(100, "firstName must be at most 100 characters."),
  lastName: z
    .string({ error: "lastName is required." })
    .trim()
    .min(1, "lastName is required.")
    .max(100, "lastName must be at most 100 characters."),
  department: z
    .string({ error: "department is required." })
    .trim()
    .min(1, "department is required.")
    .max(100, "department must be at most 100 characters."),
});

export const updateStaffSchema = createStaffSchema.partial();
