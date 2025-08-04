// Define types based on the backend schema structure
export type MessageRole = "user" | "assistant";
export type MessageType = "result" | "error";

export interface Message {
	id: number;
	content: string;
	role: MessageRole;
	type: MessageType;
	createdAt: string;
	updatedAt: string;
	fragmentId: number | null;
	projectId: number;
}

export interface Fragment {
	id: number;
	messageId: number;
	sandboxUrl: string | null;
	title: string | null;
	files?: unknown; // JSON field - optional to match backend
	createdAt: string | null;
	updatedAt: string | null;
}

export interface Project {
	id: number;
	name: string;
	createdAt: string;
	updatedAt: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface Session {
	id: string;
	expiresAt: Date;
	token: string;
	createdAt: Date;
	updatedAt: Date;
	ipAddress: string | null;
	userAgent: string | null;
	userId: string;
}

export interface Todo {
	id: number;
	text: string;
	completed: boolean;
}
