import { CheckCheck, Clock, Image, Send, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

interface ChatUser {
	id: string;
	name: string;
	role: "admin" | "doorman" | "resident";
	apartment?: string;
}

interface ChatMessage {
	id: string;
	fromUserId: string;
	toUserId: string;
	message: string;
	isRead: boolean;
	createdAt: string;
}

export const ChatPortaria = () => {
	const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
	const [selectedUserId, setSelectedUserId] = useState<string>("");
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSending, setIsSending] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const { user } = useAuth();
	const { toast } = useToast();

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	useEffect(() => {
		const loadUsers = async () => {
			try {
				const response = await apiClient.getChatUsers();
				setAvailableUsers(response.users || []);

				if (response.users && response.users.length > 0) {
					const doorman =
						response.users.find((u) => u.role === "doorman") ||
						response.users[0];
					setSelectedUserId(doorman.id);
				}
			} catch (error) {
				console.error("Erro ao carregar usuários:", error);
				toast({
					title: "Erro ao carregar contatos",
					description: "Não foi possível carregar a lista de contatos.",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		loadUsers();
	}, [toast]);

	useEffect(() => {
		const loadMessages = async () => {
			if (!selectedUserId) return;

			try {
				const response = await apiClient.getMessages(selectedUserId);
				setMessages(response.messages || []);
			} catch (error) {
				console.error("Erro ao carregar mensagens:", error);
				toast({
					title: "Erro ao carregar mensagens",
					description: "Não foi possível carregar as mensagens.",
					variant: "destructive",
				});
			}
		};

		loadMessages();
	}, [selectedUserId, toast]);

	const sendMessage = async () => {
		if (!newMessage.trim() || !selectedUserId || isSending) return;

		setIsSending(true);
		try {
			await apiClient.sendMessage({
				to_user_id: selectedUserId,
				message: newMessage.trim(),
			});

			const tempMessage: ChatMessage = {
				id: Date.now().toString(),
				fromUserId: user?.id || "",
				toUserId: selectedUserId,
				message: newMessage.trim(),
				isRead: false,
				createdAt: new Date().toISOString(),
			};

			setMessages((prev) => [...prev, tempMessage]);
			setNewMessage("");

			setTimeout(async () => {
				try {
					const response = await apiClient.getMessages(selectedUserId);
					setMessages(response.messages || []);
				} catch (error) {
					console.error("Erro ao recarregar mensagens:", error);
				}
			}, 500);

			toast({
				title: "Mensagem enviada",
				description: "Sua mensagem foi enviada com sucesso.",
			});
		} catch (error) {
			console.error("Erro ao enviar mensagem:", error);
			toast({
				title: "Erro ao enviar mensagem",
				description: "Não foi possível enviar a mensagem.",
				variant: "destructive",
			});
		} finally {
			setIsSending(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const formatTime = (timestamp: string) => {
		return new Date(timestamp).toLocaleTimeString("pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getSelectedUserName = () => {
		const selectedUser = availableUsers.find((u) => u.id === selectedUserId);
		return selectedUser ? selectedUser.name : "Selecione um contato";
	};

	const getSelectedUserRole = () => {
		const selectedUser = availableUsers.find((u) => u.id === selectedUserId);
		if (!selectedUser) return "";

		switch (selectedUser.role) {
			case "doorman":
				return "Portaria";
			case "admin":
				return "Administração";
			default:
				return selectedUser.role;
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-8rem)]">
				<div className="text-center">
					<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-muted-foreground">Carregando chat...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-[calc(100vh-8rem)]">
			<Card className="mb-4">
				<CardContent className="p-4">
					<div className="flex items-center space-x-4">
						<Users className="w-5 h-5 text-muted-foreground" />
						<div className="flex-1">
							<Select value={selectedUserId} onValueChange={setSelectedUserId}>
								<SelectTrigger>
									<SelectValue placeholder="Selecione um contato" />
								</SelectTrigger>
								<SelectContent>
									{availableUsers.map((chatUser) => (
										<SelectItem key={chatUser.id} value={chatUser.id}>
											{chatUser.name} -{" "}
											{chatUser.role === "doorman"
												? "Portaria"
												: "Administração"}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="flex-1 flex flex-col">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center space-x-2">
						<div className="w-3 h-3 bg-green-500 rounded-full"></div>
						<span>{getSelectedUserName()}</span>
						{selectedUserId && (
							<span className="text-sm text-muted-foreground">
								({getSelectedUserRole()})
							</span>
						)}
					</CardTitle>
				</CardHeader>

				<CardContent className="flex-1 flex flex-col">
					<div className="flex-1 overflow-y-auto space-y-3 mb-4">
						{!selectedUserId ? (
							<div className="flex items-center justify-center h-full">
								<div className="text-center">
									<Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
									<p className="text-muted-foreground">
										Selecione um contato para iniciar uma conversa
									</p>
								</div>
							</div>
						) : messages.length === 0 ? (
							<div className="flex items-center justify-center h-full">
								<div className="text-center">
									<Clock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
									<p className="text-muted-foreground">
										Nenhuma mensagem ainda
									</p>
									<p className="text-sm text-muted-foreground">
										Envie uma mensagem para começar a conversa
									</p>
								</div>
							</div>
						) : (
							messages.map((message) => {
								const isOwnMessage = message.fromUserId === user?.id;

								return (
									<div
										key={message.id}
										className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
									>
										<div
											className={`max-w-[70%] rounded-lg p-3 ${
												isOwnMessage
													? "bg-primary text-primary-foreground"
													: "bg-secondary text-secondary-foreground"
											}`}
										>
											<p className="text-sm">{message.message}</p>
											<div
												className={`flex items-center justify-end space-x-1 mt-1 ${
													isOwnMessage
														? "text-primary-foreground/70"
														: "text-muted-foreground"
												}`}
											>
												<span className="text-xs">
													{formatTime(message.createdAt)}
												</span>
												{isOwnMessage &&
													(message.isRead ? (
														<CheckCheck className="w-3 h-3 text-blue-400" />
													) : (
														<CheckCheck className="w-3 h-3" />
													))}
											</div>
										</div>
									</div>
								);
							})
						)}

						<div ref={messagesEndRef} />
					</div>

					<div className="border-t pt-4">
						<div className="flex space-x-2">
							<Button variant="outline" size="sm" className="px-3" disabled>
								<Image className="w-4 h-4" />
							</Button>
							<Input
								placeholder={
									selectedUserId
										? "Digite sua mensagem..."
										: "Selecione um contato primeiro"
								}
								value={newMessage}
								onChange={(e) => setNewMessage(e.target.value)}
								onKeyPress={handleKeyPress}
								className="flex-1"
								disabled={!selectedUserId || isSending}
							/>
							<Button
								onClick={sendMessage}
								disabled={!newMessage.trim() || !selectedUserId || isSending}
							>
								{isSending ? (
									<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
								) : (
									<Send className="w-4 h-4" />
								)}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
