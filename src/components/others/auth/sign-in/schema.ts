import { z } from "zod";

export const signInSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "NIP wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
  keepLoggedIn: z.boolean().optional(),
});

export type SignInFormData = z.infer<typeof signInSchema>;

