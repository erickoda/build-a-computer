import z from "zod";
import { roleValues, statusValues } from "../types/dtos";

export const updateUserSchema = z.object({
  username: z.string().min(1, "Name must be at least 1 characters long").max(255, "Name must be at most 255 characters long"),
  email: z.email("Please enter a valid email address"),
  role: z.enum(roleValues, { message: "Invalid role selected" }),
  status: z.enum(statusValues, { message: "Invalid status selected" }),
});

export type UpdateFormValues = z.infer<typeof updateUserSchema>;

