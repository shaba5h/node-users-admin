import path from "node:path";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import engine from "ejs-mate";
import methodOverride from "method-override";
import morgan from "morgan";
import { sequelize } from "./config/db";
import { env, isProd } from "./config/env";
import { initUserModel } from "./db/models/user";
import { requireAdmin } from "./modules/auth/middlewares/requireAdmin";
import authRouter from "./modules/auth/router";
import usersRouter from "./modules/users/router";
import { csrfGuard } from "./middlewares/csrfGuard";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.engine("ejs", engine);
app.set("view engine", "ejs");

app.set("views", path.join(process.cwd(), "views"));
app.use("/public", express.static(path.join(process.cwd(), "public")));

app.use(
	helmet({
		contentSecurityPolicy: false,
		crossOriginEmbedderPolicy: false,
		hsts: env.HTTPS_ENABLED ? { maxAge: 15552000 } : false,
	}),
);

app.use(morgan(isProd ? "combined" : "dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
	methodOverride((req: any) => {
		if (req.body && typeof req.body === "object" && "_method" in req.body) {
			const method = req.body._method;
			delete req.body._method;
			return method;
		}

		if (req.query && typeof (req.query as any)._method === "string") {
			return (req.query as any)._method as string;
		}
		return undefined;
	}),
);

app.use(
	session({
		name: "sid",
		secret: env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			sameSite: env.HTTPS_ENABLED ? "lax" : "strict",
			secure: env.HTTPS_ENABLED,
			maxAge: 1000 * 60 * 60,
		},
	}),
);

app.use(csrfGuard());

app.use((req, res, next) => {
	res.locals.currentUserId = (req.session as any).userId || null;
	res.locals.isAdmin = (req.session as any).isAdmin || false;

	res.locals.currentPath = req.path;
	next();
});

app.get("/", (req, res) => {
	const isLoggedIn = Boolean((req.session as any).userId);
	if (isLoggedIn) {
		return res.redirect("/admin/users");
	}
	return res.redirect("/login");
});

initUserModel();
sequelize
	.authenticate()
	.then(async () => {
		console.log("Database connection established");
	})
	.catch((err) => {
		console.error("Database connection error", err);
	});

app.use(authRouter);
app.use("/admin/users", requireAdmin, usersRouter);

app.use((req, res) => {
	res.status(404).render("partials/404", {
		title: "Page Not Found - 404",
		pageTitle: "Page Not Found",
		breadcrumbs: [
			{ title: "Home", url: "/", icon: "fas fa-home" },
			{ title: "404", url: null },
		],
	});
});

app.use(errorHandler);

export default app;
