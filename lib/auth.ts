import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

export interface JWTPayload {
    userId: string;
    email: string;
    username: string;
    role: string;
    [key: string]: unknown;
}

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "devhub-secret-key-change-in-production"
)

export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as JWTPayload;


    } catch {
        return null
    }
}


export async function getCurrentUser(): Promise<JWTPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return null;

    return verifyToken(token)
}