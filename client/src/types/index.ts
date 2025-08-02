export interface Notice {
	id: string;
	title: string;
	content: string;
	type: "maintenance" | "general" | "meeting";
	priority: "low" | "medium" | "high";
	created_by: string;
	created_at: string;
	expires_at?: string;
}
