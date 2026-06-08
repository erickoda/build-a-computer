import z from "zod";

export const emailSchema = z.object({
  email: z.email("Please enter a valid email"),
});

export const otpSchema = z.object({
  otp: z.string().min(4, "OTP code is required"),
});

export const newPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must have at least 8 chars')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(
      /[^a-zA-Z0-9]/,
      'Password must contain at least one special character',
    ),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type EmailFormValues = z.infer<typeof emailSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;
