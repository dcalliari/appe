import { z } from "zod";

export const createNoticeSchema = z.object({
	title: z.string().min(1, "Título é obrigatório"),
	content: z.string().min(1, "Conteúdo é obrigatório"),
	type: z.enum(["maintenance", "general", "meeting"]),
	priority: z.enum(["low", "medium", "high"]),
	expires_at: z.string().optional(),
});
