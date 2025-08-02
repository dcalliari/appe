import type { Notice } from "@/types";

// Define the base API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// API client instance
class ApiClient {
	private baseURL: string;
	private token: string | null = null;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
		this.token = localStorage.getItem("appe_token");
	}

	setToken(token: string) {
		this.token = token;
		localStorage.setItem("appe_token", token);
	}

	removeToken() {
		this.token = null;
		localStorage.removeItem("appe_token");
	}

	private getHeaders() {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (this.token) {
			headers.Authorization = `Bearer ${this.token}`;
		}

		return headers;
	}

	async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseURL}${endpoint}`;

		const response = await fetch(url, {
			...options,
			headers: {
				...this.getHeaders(),
				...options.headers,
			},
		});

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ message: "Network error" }));
			throw new Error(error.message || error.error || "Request failed");
		}

		return response.json();
	}

	// Auth endpoints
	async login(apartment: string, password: string) {
		const response = await this.request<{ token: string; user: any }>(
			"/api/auth/login",
			{
				method: "POST",
				body: JSON.stringify({ apartment, password }),
			},
		);

		this.setToken(response.token);
		return response;
	}

	async getProfile() {
		return this.request<{ user: any }>("/api/auth/profile");
	}

	async updateProfile(data: any) {
		return this.request("/api/auth/profile", {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	// Notices endpoints
	async getNotices() {
		return this.request<{ data: Notice[] }>("/api/notices");
	}

	async createNotice(data: any) {
		return this.request("/api/notices", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateNotice(id: string, data: any) {
		return this.request(`/api/notices/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteNotice(id: string) {
		return this.request(`/api/notices/${id}`, {
			method: "DELETE",
		});
	}

	// Chat endpoints
	async getChatUsers() {
		return this.request<{ users: any[] }>("/api/chat/users");
	}

	async getConversations() {
		return this.request<{ conversations: any[] }>("/api/chat/conversations");
	}

	async getMessages(userId: string) {
		return this.request<{ messages: any[] }>(`/api/chat/messages/${userId}`);
	}

	async sendMessage(data: { to_user_id: string; message: string }) {
		return this.request("/api/chat/send", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	// Visitors endpoints
	async getVisitors() {
		return this.request<{ success: boolean; data: any[] }>("/api/visitors");
	}

	async createVisitor(data: any) {
		return this.request("/api/visitors", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateVisitor(id: string, data: any) {
		return this.request(`/api/visitors/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async approveVisitor(id: string) {
		return this.request(`/api/visitors/${id}/approve`, {
			method: "PATCH",
		});
	}

	async rejectVisitor(id: string) {
		return this.request(`/api/visitors/${id}/reject`, {
			method: "PATCH",
		});
	}

	async deleteVisitor(id: string) {
		return this.request(`/api/visitors/${id}`, {
			method: "DELETE",
		});
	}

	// Bookings endpoints
	async getBookings() {
		return this.request<{ success: boolean; data: any[] }>("/api/bookings");
	}

	async createBooking(data: any) {
		return this.request("/api/bookings", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateBooking(id: string, data: any) {
		return this.request(`/api/bookings/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async confirmBooking(id: string) {
		return this.request(`/api/bookings/${id}/confirm`, {
			method: "PATCH",
		});
	}

	async cancelBooking(id: string) {
		return this.request(`/api/bookings/${id}/cancel`, {
			method: "PATCH",
		});
	}

	async deleteBooking(id: string) {
		return this.request(`/api/bookings/${id}`, {
			method: "DELETE",
		});
	}

	async checkAvailability(spaceName: string, date: string) {
		return this.request<{ success: boolean; available: boolean }>(
			`/api/bookings/availability/${spaceName}?date=${date}`,
		);
	}

	// Documents endpoints
	async getDocuments() {
		return this.request<{ documents: any[] }>("/api/documents");
	}

	async createDocument(data: any) {
		return this.request("/api/documents", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateDocument(id: string, data: any) {
		return this.request(`/api/documents/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteDocument(id: string) {
		return this.request(`/api/documents/${id}`, {
			method: "DELETE",
		});
	}
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
