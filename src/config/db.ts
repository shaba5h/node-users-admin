import { Sequelize } from "sequelize";
import { env, isDev, isTest } from "./env";

export const sequelize = isTest
	? new Sequelize({
			dialect: "sqlite",
			storage: ":memory:",
			pool: { max: 1, min: 1, idle: 0 },
			logging: false,
		})
	: env.DATABASE_URL
		? new Sequelize(env.DATABASE_URL, {
				dialect: "postgres",
				logging: isDev ? (msg) => console.debug(msg) : false,
			})
		: env.DB_DIALECT === "sqlite"
			? new Sequelize({
					dialect: "sqlite",
					storage: env.DB_PATH,
					logging: isDev ? (msg) => console.debug(msg) : false,
				})
			: new Sequelize({
					dialect: "postgres",
					host: env.DB_HOST,
					port: env.DB_PORT,
					database: env.DB_NAME,
					username: env.DB_USER,
					password: env.DB_PASSWORD,
					logging: isDev ? (msg) => console.debug(msg) : false,
				});
