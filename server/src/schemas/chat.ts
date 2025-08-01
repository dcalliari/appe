import { z } from "zod";

export const sendMessageSchema = z.object({
	to_user_id: z.string().min(1, "Destinatário é obrigatório"),
	message: z.string().min(1, "Mensagem é obrigatória"),
});
