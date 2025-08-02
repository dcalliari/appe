import {
	Calendar,
	Download,
	File,
	FileText,
	Receipt,
	Scale,
	Search,
	Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Document {
	id: string;
	title: string;
	category: "ata" | "boleto" | "regulamento" | "edital" | "outros";
	date: string;
	size: string;
	type: "pdf" | "image";
	url?: string;
}

const mockDocuments: Document[] = [
	{
		id: "1",
		title: "Ata da Reunião - Janeiro 2024",
		category: "ata",
		date: "2024-01-25",
		size: "2.3 MB",
		type: "pdf",
	},
	{
		id: "2",
		title: "Boleto Condomínio - Janeiro 2024",
		category: "boleto",
		date: "2024-01-01",
		size: "156 KB",
		type: "pdf",
	},
	{
		id: "3",
		title: "Regulamento Interno Atualizado",
		category: "regulamento",
		date: "2024-01-15",
		size: "1.8 MB",
		type: "pdf",
	},
	{
		id: "4",
		title: "Edital - Obras de Pintura",
		category: "edital",
		date: "2024-01-10",
		size: "890 KB",
		type: "pdf",
	},
	{
		id: "5",
		title: "Comunicado - Nova Política de Pets",
		category: "outros",
		date: "2024-01-08",
		size: "245 KB",
		type: "pdf",
	},
	{
		id: "6",
		title: "Boleto Condomínio - Dezembro 2023",
		category: "boleto",
		date: "2023-12-01",
		size: "158 KB",
		type: "pdf",
	},
];

const categories = [
	{ id: "all", name: "Todos", icon: FileText },
	{ id: "ata", name: "Atas", icon: Users },
	{ id: "boleto", name: "Boletos", icon: Receipt },
	{ id: "regulamento", name: "Regulamentos", icon: Scale },
	{ id: "edital", name: "Editais", icon: File },
	{ id: "outros", name: "Outros", icon: FileText },
];

export const DocumentsArea = () => {
	const [documents] = useState<Document[]>(mockDocuments);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

	const filteredDocuments = documents.filter((doc) => {
		const matchesSearch = doc.title
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesCategory =
			selectedCategory === "all" || doc.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const getCategoryBadge = (category: string) => {
		switch (category) {
			case "ata":
				return <Badge variant="default">Ata</Badge>;
			case "boleto":
				return <Badge variant="warning">Boleto</Badge>;
			case "regulamento":
				return <Badge variant="secondary">Regulamento</Badge>;
			case "edital":
				return <Badge variant="outline">Edital</Badge>;
			default:
				return <Badge variant="outline">Outros</Badge>;
		}
	};

	const handleDownload = (doc: Document) => {
		const link = window.document.createElement("a");
		link.href = "#";
		link.download = `${doc.title}.pdf`;
		link.click();
	};

	const groupDocumentsByMonth = (docs: Document[]) => {
		const grouped = docs.reduce(
			(acc, doc) => {
				const date = new Date(doc.date);
				const monthYear = date.toLocaleDateString("pt-BR", {
					month: "long",
					year: "numeric",
				});

				if (!acc[monthYear]) {
					acc[monthYear] = [];
				}
				acc[monthYear].push(doc);

				return acc;
			},
			{} as Record<string, Document[]>,
		);

		return Object.entries(grouped).sort((a, b) => {
			const dateA = new Date(a[1][0].date);
			const dateB = new Date(b[1][0].date);
			return dateB.getTime() - dateA.getTime();
		});
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Documentos</h2>
				<Badge variant="outline">{filteredDocuments.length} documentos</Badge>
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
				<Input
					placeholder="Buscar documentos..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-10"
				/>
			</div>

			<Tabs
				value={selectedCategory}
				onValueChange={setSelectedCategory}
				className="w-full"
			>
				<TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
					{categories.map((category) => {
						const Icon = category.icon;
						return (
							<TabsTrigger
								key={category.id}
								value={category.id}
								className="text-xs"
							>
								<Icon className="w-3 h-3 mr-1" />
								{category.name}
							</TabsTrigger>
						);
					})}
				</TabsList>

				{categories.map((category) => (
					<TabsContent
						key={category.id}
						value={category.id}
						className="space-y-4"
					>
						{groupDocumentsByMonth(filteredDocuments).map(
							([monthYear, docs]) => (
								<div key={monthYear}>
									<h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
										<Calendar className="w-4 h-4 mr-1" />
										{monthYear}
									</h3>

									<div className="space-y-2">
										{docs.map((document) => (
											<Card key={document.id}>
												<CardContent className="pt-4">
													<div className="flex items-start justify-between">
														<div className="flex-1">
															<div className="flex items-center space-x-2 mb-2">
																<FileText className="w-4 h-4 text-muted-foreground" />
																<h4 className="font-medium text-sm">
																	{document.title}
																</h4>
																{getCategoryBadge(document.category)}
															</div>

															<div className="flex items-center space-x-4 text-xs text-muted-foreground">
																<span>
																	{new Date(document.date).toLocaleDateString(
																		"pt-BR",
																	)}
																</span>
																<span>{document.size}</span>
																<span className="uppercase">
																	{document.type}
																</span>
															</div>
														</div>

														<Button
															variant="outline"
															size="sm"
															onClick={() => handleDownload(document)}
														>
															<Download className="w-3 h-3 mr-1" />
															Baixar
														</Button>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							),
						)}

						{filteredDocuments.length === 0 && (
							<Card>
								<CardContent className="pt-6 text-center">
									<FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
									<p className="text-muted-foreground">
										{searchTerm
											? "Nenhum documento encontrado com os filtros aplicados"
											: "Nenhum documento disponível nesta categoria"}
									</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
};
