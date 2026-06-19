import { z } from "zod";
import { roleValues } from "../types/dtos";

export const createUserSchema = z.object({
  username: z.string().min(1, "Name must be at least 1 character long").max(255, "Name must be at most 255 characters long"),
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, 'Password must have at least 8 chars')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(
      /[^a-zA-Z0-9]/,
      'Password must contain at least one special character',
    ),
  role: z.enum(roleValues, { message: "Invalid role selected" }),
});

export type CreateFormValues = z.infer<typeof createUserSchema>;
