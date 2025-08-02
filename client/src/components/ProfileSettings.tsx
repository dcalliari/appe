import {
	Bell,
	Building2,
	Eye,
	EyeOff,
	Lock,
	Mail,
	Shield,
	Smartphone,
	User,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const ProfileSettings = () => {
	const { user } = useAuth();
	const { toast } = useToast();

	const [notifications, setNotifications] = useState({
		newNotices: true,
		chatMessages: true,
		deliveries: true,
		bookingUpdates: true,
		maintenanceAlerts: false,
	});

	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handleNotificationChange = (key: string, value: boolean) => {
		setNotifications((prev) => ({ ...prev, [key]: value }));

		toast({
			title: "Configuração salva",
			description: `Notificações ${value ? "ativadas" : "desativadas"} com sucesso.`,
		});
	};

	const handlePasswordChange = () => {
		if (
			!passwordForm.currentPassword ||
			!passwordForm.newPassword ||
			!passwordForm.confirmPassword
		) {
			toast({
				title: "Campos obrigatórios",
				description: "Preencha todos os campos de senha.",
				variant: "destructive",
			});
			return;
		}

		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			toast({
				title: "Senhas não conferem",
				description: "A nova senha e confirmação devem ser iguais.",
				variant: "destructive",
			});
			return;
		}

		if (passwordForm.newPassword.length < 6) {
			toast({
				title: "Senha muito curta",
				description: "A nova senha deve ter pelo menos 6 caracteres.",
				variant: "destructive",
			});
			return;
		}

		setPasswordForm({
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		});

		toast({
			title: "Senha alterada",
			description: "Sua senha foi alterada com sucesso.",
		});
	};

	const apartmentInfo = {
		building: "Torre A",
		floor: Math.floor(parseInt(user?.apartment || "101") / 100),
		residents: 2,
		parking: "Vaga 15",
		phone: "(11) 99999-9999",
		email: "joao.silva@email.com",
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Perfil e Configurações</h2>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<User className="w-5 h-5" />
						<span>Informações Pessoais</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center space-x-4">
						<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
							<User className="w-8 h-8 text-primary" />
						</div>
						<div className="flex-1">
							<h3 className="font-medium text-lg">{user?.name}</h3>
							<p className="text-muted-foreground">
								Apartamento {user?.apartment}
							</p>
							<Badge variant="outline" className="mt-1">
								{user?.role === "resident" ? "Morador" : "Administrador"}
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Building2 className="w-5 h-5" />
						<span>Informações do Apartamento</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<Label className="text-muted-foreground">Prédio</Label>
							<p className="font-medium">{apartmentInfo.building}</p>
						</div>
						<div>
							<Label className="text-muted-foreground">Andar</Label>
							<p className="font-medium">{apartmentInfo.floor}º andar</p>
						</div>
						<div>
							<Label className="text-muted-foreground">Moradores</Label>
							<p className="font-medium">{apartmentInfo.residents} pessoas</p>
						</div>
						<div>
							<Label className="text-muted-foreground">Garagem</Label>
							<p className="font-medium">{apartmentInfo.parking}</p>
						</div>
					</div>

					<Separator />

					<div className="space-y-2">
						<div className="flex items-center space-x-2">
							<Smartphone className="w-4 h-4 text-muted-foreground" />
							<span className="text-sm">{apartmentInfo.phone}</span>
						</div>
						<div className="flex items-center space-x-2">
							<Mail className="w-4 h-4 text-muted-foreground" />
							<span className="text-sm">{apartmentInfo.email}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Bell className="w-5 h-5" />
						<span>Notificações</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<Label>Novos avisos do mural</Label>
								<p className="text-sm text-muted-foreground">
									Receber notificações quando novos avisos forem publicados
								</p>
							</div>
							<Switch
								checked={notifications.newNotices}
								onCheckedChange={(checked) =>
									handleNotificationChange("newNotices", checked)
								}
							/>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div>
								<Label>Mensagens da portaria</Label>
								<p className="text-sm text-muted-foreground">
									Notificações de novas mensagens no chat
								</p>
							</div>
							<Switch
								checked={notifications.chatMessages}
								onCheckedChange={(checked) =>
									handleNotificationChange("chatMessages", checked)
								}
							/>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div>
								<Label>Entregas recebidas</Label>
								<p className="text-sm text-muted-foreground">
									Avisos sobre entregas e encomendas
								</p>
							</div>
							<Switch
								checked={notifications.deliveries}
								onCheckedChange={(checked) =>
									handleNotificationChange("deliveries", checked)
								}
							/>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div>
								<Label>Status de reservas</Label>
								<p className="text-sm text-muted-foreground">
									Atualizações sobre suas reservas de espaços
								</p>
							</div>
							<Switch
								checked={notifications.bookingUpdates}
								onCheckedChange={(checked) =>
									handleNotificationChange("bookingUpdates", checked)
								}
							/>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div>
								<Label>Alertas de manutenção</Label>
								<p className="text-sm text-muted-foreground">
									Avisos sobre manutenções que podem afetar você
								</p>
							</div>
							<Switch
								checked={notifications.maintenanceAlerts}
								onCheckedChange={(checked) =>
									handleNotificationChange("maintenanceAlerts", checked)
								}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Shield className="w-5 h-5" />
						<span>Alterar Senha</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-3">
						<div>
							<Label htmlFor="current-password">Senha atual</Label>
							<div className="relative">
								<Input
									id="current-password"
									type={showCurrentPassword ? "text" : "password"}
									value={passwordForm.currentPassword}
									onChange={(e) =>
										setPasswordForm((prev) => ({
											...prev,
											currentPassword: e.target.value,
										}))
									}
									className="pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3"
									onClick={() => setShowCurrentPassword(!showCurrentPassword)}
								>
									{showCurrentPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</Button>
							</div>
						</div>

						<div>
							<Label htmlFor="new-password">Nova senha</Label>
							<div className="relative">
								<Input
									id="new-password"
									type={showNewPassword ? "text" : "password"}
									value={passwordForm.newPassword}
									onChange={(e) =>
										setPasswordForm((prev) => ({
											...prev,
											newPassword: e.target.value,
										}))
									}
									className="pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3"
									onClick={() => setShowNewPassword(!showNewPassword)}
								>
									{showNewPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</Button>
							</div>
						</div>

						<div>
							<Label htmlFor="confirm-password">Confirmar nova senha</Label>
							<Input
								id="confirm-password"
								type="password"
								value={passwordForm.confirmPassword}
								onChange={(e) =>
									setPasswordForm((prev) => ({
										...prev,
										confirmPassword: e.target.value,
									}))
								}
							/>
						</div>

						<Button onClick={handlePasswordChange} className="w-full">
							<Lock className="w-4 h-4 mr-2" />
							Alterar Senha
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
