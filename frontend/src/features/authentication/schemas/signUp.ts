import z from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, 'Please enter a username'),
  email: z.email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must have at least 8 chars')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(
      /[^a-zA-Z0-9]/,
      'Password must contain at least one special character',
    ),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
