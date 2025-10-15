import type { RequestHandler } from "express";
import { validationResult, matchedData } from "express-validator";
import { authenticateUser } from "../services/authService";

export const renderLogin: RequestHandler = (_req, res) => {
	res.render("auth/login", { error: null });
};

export const postLogin: RequestHandler = async (req, res) => {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		const vals = matchedData(req, {
			locations: ["body"],
			includeOptionals: true,
		});
		return res.status(422).render("auth/login", {
			error: Object.values(result.mapped())
				.map((e: any) => e.msg)
				.join(". "),
			// keep entered username
			username: vals.username ?? "",
		});
	}

	const { username, password } = (req.body || {}) as {
		username?: string;
		password?: string;
	};
	const user = await authenticateUser(
		String(username || ""),
		String(password || ""),
	);
	if (!user) {
		return res
			.status(401)
			.render("auth/login", { error: "Invalid credentials" });
	}
	// Deny access for non-admin accounts with explicit message
	if (!user.is_admin) {
		return res
			.status(403)
			.render("auth/login", { error: "Insufficient permissions: administrator access required" });
	}
	(req.session as any).userId = user.id;
	(req.session as any).isAdmin = user.is_admin;
	return res.redirect("/");
};

export const logout: RequestHandler = (req, res) => {
	req.session.destroy(() => {
		res.redirect("/login");
	});
};
