import { body } from "express-validator";

export const loginValidators = [
	body("username")
		.trim()
		.notEmpty()
		.withMessage("Username is required")
		.isLength({ min: 3, max: 100 })
		.withMessage("Username length must be 3–100 characters"),
	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isLength({ min: 6, max: 100 })
		.withMessage("Password must be at least 6 characters"),
];
