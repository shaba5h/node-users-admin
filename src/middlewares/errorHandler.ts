import type { Request, Response, NextFunction } from "express";

export function errorHandler(
	err: any,
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	console.error("Unhandled error", { err });
	if (res.headersSent) {
		return;
	}

	if (err && err.code === "EBADCSRFTOKEN") {
		const message = "Invalid CSRF token. Refresh the page and try again.";
		if (req.path === "/login" || req.path === "/logout") {
			const nextToken = (req as any).csrfToken?.() ?? null;
			return res
				.status(403)
				.render("auth/login", { error: message, csrfToken: nextToken });
		}
		return res.status(403).send("Forbidden: invalid CSRF token");
	}

	res.status(500).send("Internal Server Error");
}
