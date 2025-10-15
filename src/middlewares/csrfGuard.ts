import type { Request, Response, NextFunction } from "express";
import csrf from "csurf";

export const csrfGuard = () => {
	const csrfProtection = csrf();
	return [
		csrfProtection,
		(req: Request, res: Response, next: NextFunction) => {
			try {
				res.locals.csrfToken = (req as any).csrfToken?.() ?? null;
				return next();
			} catch (e) {
				return next(e);
			}
		},
	];
};
