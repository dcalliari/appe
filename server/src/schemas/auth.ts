import { z } from "zod";

export const loginSchema = z.object({
	apartment: z.string().min(1, "Apartamento é obrigatório"),
	password: z.string().min(1, "Senha é obrigatória"),
});

export const updateProfileSchema = z.object({
	name: z.string().min(1).optional(),
	email: z.email().optional(),
	phone: z.string().optional(),
	password: z.string().min(6).optional(),
});
