import { Building2, Lock, User } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const LoginScreen = () => {
	const [apartment, setApartment] = useState("");
	const [password, setPassword] = useState("");
	const { login, isLoading } = useAuth();
	const { toast } = useToast();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!apartment || !password) {
			toast({
				title: "Campos obrigatórios",
				description: "Por favor, preencha o apartamento e a senha.",
				variant: "destructive",
			});
			return;
		}

		const success = await login(apartment, password);

		if (!success) {
			toast({
				title: "Erro de acesso",
				description: "Apartamento ou senha incorretos.",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary/10 to-background flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
						<Building2 className="w-8 h-8 text-primary-foreground" />
					</div>
					<CardTitle className="text-2xl font-bold">Appê</CardTitle>
					<CardDescription>
						Sistema de comunicação do condomínio
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="apartment">Apartamento</Label>
							<div className="relative">
								<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
								<Input
									id="apartment"
									type="text"
									placeholder="Ex: 101, 202, admin"
									value={apartment}
									onChange={(e) => setApartment(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Senha</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
								<Input
									id="password"
									type="password"
									placeholder="Digite sua senha"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Entrando..." : "Entrar"}
						</Button>
					</form>

					<div className="mt-6 p-4 bg-muted rounded-lg">
						<p className="text-sm text-muted-foreground text-center mb-2">
							<strong>Usuários de teste:</strong>
						</p>
						<div className="text-xs text-muted-foreground space-y-1">
							<p>• Apartamento: 101, Senha: 123456</p>
							<p>• Apartamento: 202, Senha: 123456</p>
							<p>• Admin: admin, Senha: admin123</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
