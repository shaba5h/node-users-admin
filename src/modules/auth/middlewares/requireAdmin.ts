import type { NextFunction, Request, Response } from "express";

export function requireAdmin(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const sess = (req.session as any) || {};
	if (sess.userId && sess.isAdmin === true) {
		next();
		return;
	}
	res.redirect("/login");
}
