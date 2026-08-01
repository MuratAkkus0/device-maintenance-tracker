import { z } from "zod";

export const createMaintenanceRecordSchema = z.object({
  performedAt: z
    .string({ error: "performedAt is required." })
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "performedAt must be a valid date.",
    }),
  notes: z.string().trim().max(2000, "notes must be at most 2000 characters.").optional(),
});
