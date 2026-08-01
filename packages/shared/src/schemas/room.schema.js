import { z } from "zod";

export const createRoomSchema = z.object({
  name: z
    .string({ error: "name is required." })
    .trim()
    .min(1, "name is required.")
    .max(100, "name must be at most 100 characters."),
});

export const updateRoomSchema = createRoomSchema.partial();
