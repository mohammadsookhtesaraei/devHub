import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

export interface JWTPayload {
    userId: string;
    email: string;
    username: string;
    role: string;
    [key: string]: unknown;
}


// یک سکرت کی داخل سرور میسازیم
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "devhub-secret-key-change-in-production"
)


//  که از کتابخونه اوزه میاد  توکن و سکرت سرور رو میگیره چک میکنه ایا امضا  برا همین سرور هست  یا جعلیjwtverify  این تابع توکن رو به عنوام ورودی میگیره و با 
// یا جعلی هست اگه درست باشه اطلاعات کاربر رو میده نباشه نال بر میگردونه

export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as JWTPayload;


    } catch {
        return null
    }
}


// این تابع قراره اطلاعات کاربر رو بما بده
// توکن رو از کوکی میگیریم اگه توکن وجود نداشت نال
// اگه توکن وجود داره میدیم به تابع وریفای توکن که در بالا تعریف کردیم
// سکرت کی و توکن رو چک میکنه اگه درست باشه اطلاعات کاربر رو بما میده
export async function getCurrentUser(): Promise<JWTPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return null;

    return verifyToken(token)
}