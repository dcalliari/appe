import {
	Bell,
	Calendar,
	FileText,
	Home,
	LogOut,
	MessageCircle,
	Settings,
	Users,
} from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
	activeTab,
	onTabChange,
}) => {
	const { user, logout } = useAuth();

	const navItems = [
		{ id: "home", label: "Mural", icon: Home },
		{ id: "chat", label: "Portaria", icon: MessageCircle },
		{ id: "visitors", label: "Visitantes", icon: Users },
		{ id: "bookings", label: "Reservas", icon: Calendar },
		{ id: "documents", label: "Documentos", icon: FileText },
		{ id: "profile", label: "Perfil", icon: Settings },
	];

	return (
		<>
			<header className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
						<Home className="w-5 h-5" />
					</div>
					<div>
						<h1 className="font-bold text-lg">Appê</h1>
						<p className="text-primary-foreground/80 text-sm">
							Apt. {user?.apartment}
						</p>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="ghost"
						size="sm"
						className="text-primary-foreground hover:bg-primary-foreground/20"
					>
						<Bell className="w-4 h-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={logout}
						className="text-primary-foreground hover:bg-primary-foreground/20"
					>
						<LogOut className="w-4 h-4" />
					</Button>
				</div>
			</header>

			<nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2">
				<div className="flex justify-around">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = activeTab === item.id;

						return (
							<Button
								key={item.id}
								variant="ghost"
								size="sm"
								onClick={() => onTabChange(item.id)}
								className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 ${
									isActive
										? "text-primary bg-primary/10"
										: "text-muted-foreground"
								}`}
							>
								<Icon className="w-5 h-5" />
								<span className="text-xs">{item.label}</span>
							</Button>
						);
					})}
				</div>
			</nav>
		</>
	);
};
