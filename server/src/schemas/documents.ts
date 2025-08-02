import { z } from "zod";

export const documentSchema = z.object({
	title: z.string().min(1, "Título é obrigatório"),
	file_path: z.string().min(1, "Caminho do arquivo é obrigatório"),
	category: z.enum([
		"meeting_minutes",
		"bills",
		"regulations",
		"announcements",
	]),
});

export const updateDocumentSchema = z.object({
	title: z.string().min(1, "Título é obrigatório").optional(),
	file_path: z.string().min(1, "Caminho do arquivo é obrigatório").optional(),
	category: z
		.enum(["meeting_minutes", "bills", "regulations", "announcements"])
		.optional(),
});
