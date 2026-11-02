// اتصال Drizzle ORM به دیتابیس PostgreSQL از طریق درایور node-postgres
import { drizzle } from "drizzle-orm/node-postgres";

// وارد کردن Pool
//  برای مدیریت اتصال‌های دیتابیس
import { Pool } from "pg";

// دریافت آدرس اتصال دیتابیس از متغیرهای محیطی
const databaseUrl = process.env.DATABASE_URL;

// بررسی اینکه آدرس دیتابیس تعریف شده باشد
if (!databaseUrl) {
    // در صورت نبودن آدرس، اجرای برنامه متوقف می‌شود
    throw new Error("DATABASE_URL is required");
}

// تعریف یک متغیر سراسری برای نگهداری 
// Pool
//  در محیط 
// Node.js
const globalForDb = globalThis as typeof globalThis & {
    // تعیین نوع 
    // Pool
    //  برای این متغیر سراسری
    __arenaNextJsPostgresqlPool?: Pool;
};

// اگر 
// Pool
//  قبلاً ساخته شده،
//  از همان استفاده کن؛ 
// در غیر این صورت یک 
// Pool
//  جدید بساز
export const pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
        // تنظیم آدرس اتصال به دیتابیس
        connectionString: databaseUrl,
    });

// بررسی اینکه برنامه در محیط توسعه اجرا می‌شود یا خیر
if (process.env.NODE_ENV !== "production") {
    // ذخیره Pool در globalThis برای جلوگیری از ساخت اتصال‌های تکراری هنگام Hot Reload
    globalForDb.__arenaNextJsPostgresqlPool = pool;
}

// ساخت نمونه Drizzle و اتصال آن به Pool دیتابیس
export const db = drizzle({ client: pool });


// این کد یک اتصال مشترک و قابل استفاده مجدد به دیتابیس 
// PostgreSQL
//  با استفاده از 
// Drizzle ORM 
// و 
// node-postgres
//  ایجاد می‌کند
//  و با ذخیره‌سازی 
// Pool در 
// globalThis
//  در محیط توسعه 
// Next.js
//  از ایجاد اتصال‌های تکراری هنگام 
// Hot Reload 
// جلوگیری می‌کند.