import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

interface User {
	id: string;
	apartment: string;
	name: string;
	email?: string;
	role: "resident" | "admin" | "doorman";
	phone?: string;
}

interface AuthContextType {
	user: User | null;
	login: (apartment: string, password: string) => Promise<boolean>;
	logout: () => void;
	isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			const token = localStorage.getItem("appe_token");
			const savedUser = localStorage.getItem("appe_user");

			if (token && savedUser) {
				try {
					// Verify token is still valid
					const response = await apiClient.getProfile();
					setUser(response.user);
				} catch {
					// Token is invalid, clear storage
					localStorage.removeItem("appe_token");
					localStorage.removeItem("appe_user");
					apiClient.removeToken();
				}
			}
			setIsLoading(false);
		};

		checkAuth();
	}, []);

	const login = async (
		apartment: string,
		password: string,
	): Promise<boolean> => {
		setIsLoading(true);

		try {
			const response = await apiClient.login(apartment, password);
			const userData = response.user;

			setUser(userData);
			localStorage.setItem("appe_user", JSON.stringify(userData));
			setIsLoading(false);
			return true;
		} catch (error) {
			console.error("Login error:", error);
			setIsLoading(false);
			return false;
		}
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("appe_user");
		localStorage.removeItem("appe_token");
		apiClient.removeToken();
	};

	return (
		<AuthContext.Provider value={{ user, login, logout, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
