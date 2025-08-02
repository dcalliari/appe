import { Calendar, Check, Clock, MapPin, Plus, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

interface SpaceBooking {
	id: string;
	user_id: string;
	space_name: string;
	booking_date: string;
	start_time: string;
	end_time: string;
	status: "pending" | "approved" | "rejected" | "cancelled";
	created_at: string;
}

const AVAILABLE_SPACES = [
	"Salão de Festas",
	"Churrasqueira",
	"Playground",
	"Quadra de Tênis",
	"Piscina",
	"Academia",
];

export const SpaceBookings = () => {
	const [bookings, setBookings] = useState<SpaceBooking[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [formData, setFormData] = useState({
		space_name: "",
		booking_date: "",
		start_time: "",
		end_time: "",
	});
	const { user } = useAuth();
	const { toast } = useToast();

	useEffect(() => {
		const loadBookings = async () => {
			try {
				const response = await apiClient.getBookings();
				setBookings(response.data || []);
			} catch (error) {
				console.error("Erro ao carregar reservas:", error);
				toast({
					title: "Erro ao carregar reservas",
					description: "Não foi possível carregar a lista de reservas.",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		loadBookings();
	}, [toast]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!formData.space_name ||
			!formData.booking_date ||
			!formData.start_time ||
			!formData.end_time
		) {
			toast({
				title: "Campos obrigatórios",
				description: "Todos os campos são obrigatórios.",
				variant: "destructive",
			});
			return;
		}

		try {
			await apiClient.createBooking({
				space_name: formData.space_name,
				booking_date: formData.booking_date,
				start_time: formData.start_time,
				end_time: formData.end_time,
			});

			toast({
				title: "Reserva criada",
				description: "Reserva criada com sucesso. Aguarde aprovação.",
			});

			setFormData({
				space_name: "",
				booking_date: "",
				start_time: "",
				end_time: "",
			});
			setIsDialogOpen(false);
			loadBookingsData();
		} catch (error) {
			console.error("Erro ao criar reserva:", error);
			toast({
				title: "Erro ao criar reserva",
				description: "Não foi possível criar a reserva.",
				variant: "destructive",
			});
		}
	};

	const loadBookingsData = async () => {
		try {
			const response = await apiClient.getBookings();
			setBookings(response.data || []);
		} catch (error) {
			console.error("Erro ao carregar reservas:", error);
		}
	};

	const handleConfirm = async (id: string) => {
		try {
			await apiClient.confirmBooking(id);
			toast({
				title: "Reserva confirmada",
				description: "A reserva foi confirmada com sucesso.",
			});
			loadBookingsData();
		} catch (error) {
			console.error("Erro ao confirmar reserva:", error);
			toast({
				title: "Erro ao confirmar",
				description: "Não foi possível confirmar a reserva.",
				variant: "destructive",
			});
		}
	};

	const handleCancel = async (id: string) => {
		try {
			await apiClient.cancelBooking(id);
			toast({
				title: "Reserva cancelada",
				description: "A reserva foi cancelada.",
			});
			loadBookingsData();
		} catch (error) {
			console.error("Erro ao cancelar reserva:", error);
			toast({
				title: "Erro ao cancelar",
				description: "Não foi possível cancelar a reserva.",
				variant: "destructive",
			});
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await apiClient.deleteBooking(id);
			toast({
				title: "Reserva removida",
				description: "A reserva foi removida com sucesso.",
			});
			loadBookingsData();
		} catch (error) {
			console.error("Erro ao remover reserva:", error);
			toast({
				title: "Erro ao remover",
				description: "Não foi possível remover a reserva.",
				variant: "destructive",
			});
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-bold">Reserva de Espaços</h2>
				</div>
				<div className="grid gap-4">
					{[1, 2, 3].map((i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader>
								<div className="h-4 bg-muted rounded w-3/4"></div>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="h-3 bg-muted rounded"></div>
									<div className="h-3 bg-muted rounded w-2/3"></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Reserva de Espaços</h2>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="w-4 h-4 mr-2" />
							Nova Reserva
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Nova Reserva de Espaço</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<Label htmlFor="space_name">Espaço *</Label>
								<Select
									value={formData.space_name}
									onValueChange={(value) =>
										setFormData({ ...formData, space_name: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Selecione um espaço" />
									</SelectTrigger>
									<SelectContent>
										{AVAILABLE_SPACES.map((space) => (
											<SelectItem key={space} value={space}>
												{space}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="booking_date">Data *</Label>
								<Input
									id="booking_date"
									type="date"
									value={formData.booking_date}
									onChange={(e) =>
										setFormData({ ...formData, booking_date: e.target.value })
									}
									required
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="start_time">Hora Início *</Label>
									<Input
										id="start_time"
										type="time"
										value={formData.start_time}
										onChange={(e) =>
											setFormData({ ...formData, start_time: e.target.value })
										}
										required
									/>
								</div>
								<div>
									<Label htmlFor="end_time">Hora Fim *</Label>
									<Input
										id="end_time"
										type="time"
										value={formData.end_time}
										onChange={(e) =>
											setFormData({ ...formData, end_time: e.target.value })
										}
										required
									/>
								</div>
							</div>
							<Button type="submit" className="w-full">
								Criar Reserva
							</Button>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<Tabs defaultValue="pending" className="space-y-4">
				<TabsList>
					<TabsTrigger value="pending">
						Pendentes ({bookings.filter((b) => b.status === "pending").length})
					</TabsTrigger>
					<TabsTrigger value="approved">
						Aprovadas ({bookings.filter((b) => b.status === "approved").length})
					</TabsTrigger>
					<TabsTrigger value="all">Todas ({bookings.length})</TabsTrigger>
				</TabsList>

				<TabsContent value="pending">
					<div className="space-y-4">
						{bookings
							.filter((b) => b.status === "pending")
							.map((booking) => (
								<BookingCard
									key={booking.id}
									booking={booking}
									onConfirm={handleConfirm}
									onCancel={handleCancel}
									onDelete={handleDelete}
									user={user}
									showActions={true}
								/>
							))}
						{bookings.filter((b) => b.status === "pending").length === 0 && (
							<Card>
								<CardContent className="flex items-center justify-center py-8">
									<div className="text-center">
										<Clock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
										<p className="text-muted-foreground">
											Nenhuma reserva pendente
										</p>
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</TabsContent>

				<TabsContent value="approved">
					<div className="space-y-4">
						{bookings
							.filter((b) => b.status === "approved")
							.map((booking) => (
								<BookingCard
									key={booking.id}
									booking={booking}
									onConfirm={handleConfirm}
									onCancel={handleCancel}
									onDelete={handleDelete}
									user={user}
									showActions={false}
								/>
							))}
						{bookings.filter((b) => b.status === "approved").length === 0 && (
							<Card>
								<CardContent className="flex items-center justify-center py-8">
									<div className="text-center">
										<Check className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
										<p className="text-muted-foreground">
											Nenhuma reserva aprovada
										</p>
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</TabsContent>

				<TabsContent value="all">
					<div className="space-y-4">
						{bookings.map((booking) => (
							<BookingCard
								key={booking.id}
								booking={booking}
								onConfirm={handleConfirm}
								onCancel={handleCancel}
								onDelete={handleDelete}
								user={user}
								showActions={booking.status === "pending"}
							/>
						))}
						{bookings.length === 0 && (
							<Card>
								<CardContent className="flex items-center justify-center py-8">
									<div className="text-center">
										<MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
										<p className="text-muted-foreground">
											Nenhuma reserva encontrada
										</p>
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
};

interface BookingCardProps {
	booking: SpaceBooking;
	onConfirm: (id: string) => void;
	onCancel: (id: string) => void;
	onDelete: (id: string) => void;
	user: { id: string; role: string } | null;
	showActions: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({
	booking,
	onConfirm,
	onCancel,
	onDelete,
	user,
	showActions,
}) => {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("pt-BR");
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "approved":
				return (
					<Badge variant="default" className="bg-green-100 text-green-800">
						Aprovada
					</Badge>
				);
			case "rejected":
				return <Badge variant="destructive">Rejeitada</Badge>;
			case "cancelled":
				return <Badge variant="secondary">Cancelada</Badge>;
			default:
				return <Badge variant="secondary">Pendente</Badge>;
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-primary/10 rounded-full">
							<MapPin className="w-5 h-5 text-primary" />
						</div>
						<div>
							<CardTitle className="text-lg">{booking.space_name}</CardTitle>
							<div className="flex items-center space-x-2 mt-1">
								{getStatusBadge(booking.status)}
								<span className="text-sm text-muted-foreground">
									<Calendar className="w-4 h-4 inline mr-1" />
									{formatDate(booking.booking_date)}
								</span>
								<span className="text-sm text-muted-foreground">
									<Clock className="w-4 h-4 inline mr-1" />
									{booking.start_time} - {booking.end_time}
								</span>
							</div>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground mb-3">
					<strong>Solicitado em:</strong> {formatDate(booking.created_at)}
				</p>

				{showActions && user?.role === "admin" && (
					<div className="flex space-x-2">
						<Button
							size="sm"
							onClick={() => onConfirm(booking.id)}
							className="bg-green-600 hover:bg-green-700"
						>
							<Check className="w-4 h-4 mr-1" />
							Aprovar
						</Button>
						<Button
							size="sm"
							variant="destructive"
							onClick={() => onCancel(booking.id)}
						>
							<X className="w-4 h-4 mr-1" />
							Cancelar
						</Button>
					</div>
				)}

				{user?.role === "admin" && (
					<div className="mt-2">
						<Button
							size="sm"
							variant="outline"
							onClick={() => onDelete(booking.id)}
						>
							Remover
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
