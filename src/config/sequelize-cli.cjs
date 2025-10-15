require("dotenv").config();

/**
 * @param {string} storage
 * @returns {{ dialect: string, storage: string }}
 */
const makeSqlite = (storage) => ({ dialect: "sqlite", storage });
/**
 * @returns {object}
 */
const makePgByEnv = () => {
	if (process.env.DATABASE_URL) {
		return { use_env_variable: "DATABASE_URL", dialect: "postgres" };
	}
	return {
		dialect: "postgres",
		host: process.env.DB_HOST || "127.0.0.1",
		port: Number(process.env.DB_PORT) || 5432,
		database: process.env.DB_NAME || "app_db",
		username: process.env.DB_USER || "postgres",
		password: process.env.DB_PASSWORD || "",
	};
};

module.exports = {
	development:
		process.env.DB_DIALECT === "postgres" || process.env.DATABASE_URL
			? makePgByEnv()
			: makeSqlite(process.env.DB_PATH || "db.sqlite"),
	test: makeSqlite(":memory:"),
	production:
		process.env.DB_DIALECT === "postgres" || process.env.DATABASE_URL
			? makePgByEnv()
			: makeSqlite(process.env.DB_PATH || "db.sqlite"),
};
