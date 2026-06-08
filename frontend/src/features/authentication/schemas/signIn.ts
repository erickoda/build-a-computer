import z from "zod";

export const signInSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z
    .string()
});

export type SignInFormValues = z.infer<typeof signInSchema>;

