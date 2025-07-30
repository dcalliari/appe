export interface JWTPayload {
	userId: string;
	apartment: string;
	role: string;
	exp: number;
}
