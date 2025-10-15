import dotenv from "dotenv";

dotenv.config();

export const env = {
	NODE_ENV: process.env.NODE_ENV || "development",
	PORT: Number(process.env.PORT) || 3000,
	SESSION_SECRET: process.env.SESSION_SECRET || "change_this_dev_secret",
	DB_PATH: process.env.DB_PATH || "db.sqlite",
	ADMIN_USERNAME: process.env.ADMIN_USERNAME || "admin",
	ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin123",
	DB_DIALECT: process.env.DB_DIALECT || "postgres",
	DATABASE_URL: process.env.DATABASE_URL || "",
	DB_HOST: process.env.DB_HOST || "127.0.0.1",
	DB_PORT: Number(process.env.DB_PORT) || 5432,
	DB_NAME: process.env.DB_NAME || "app_db",
	DB_USER: process.env.DB_USER || "postgres",
	DB_PASSWORD: process.env.DB_PASSWORD || "",
	HTTPS_ENABLED: process.env.HTTPS_ENABLED === "true",
};

export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
