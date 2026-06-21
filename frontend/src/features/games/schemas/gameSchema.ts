import { z } from "zod";

export const gameSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 character long").max(1024, "Name must be at most 1024 characters long"),
  necessary_disk: z
    .string()
    .min(1, "Necessary disk is required")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, "Necessary disk must be a positive integer"),
});

export type GameFormValues = z.infer<typeof gameSchema>;
