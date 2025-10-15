import { body, param, query } from "express-validator";

export const listQueryValidators = [
	query("page")
		.optional()
		.toInt()
		.isInt({ min: 1 })
		.withMessage("Invalid page"),
	query("sortBy")
		.optional()
		.isIn(["username", "full_name", "birthdate"])
		.withMessage("Invalid sort field"),
	query("sortDir")
		.optional()
		.isIn(["asc", "desc"])
		.withMessage("Invalid sort direction"),
	query("q")
		.optional()
		.trim()
		.isLength({ max: 100 })
		.withMessage("Query too long"),
];

export const idParamValidator = [
	param("id").toInt().isInt({ min: 1 }).withMessage("Invalid ID"),
];

export const createUserValidators = [
	body("username")
		.trim()
		.notEmpty()
		.withMessage("Username is required")
		.isLength({ min: 3, max: 100 })
		.withMessage("Username length must be 3–100 characters"),
	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters"),
	body("first_name")
		.trim()
		.notEmpty()
		.withMessage("First name is required")
		.isLength({ max: 100 })
		.withMessage("Max first name length is 100 characters"),
	body("last_name")
		.trim()
		.notEmpty()
		.withMessage("Last name is required")
		.isLength({ max: 100 })
		.withMessage("Max last name length is 100 characters"),
	body("gender").isIn(["male", "female"]).withMessage("Invalid gender value"),
	body("birthdate")
		.notEmpty()
		.withMessage("Birthdate is required")
		.isISO8601()
		.withMessage("Invalid birthdate (YYYY-MM-DD)"),
];

export const updateUserValidators = [
	...idParamValidator,
	body("username")
		.optional()
		.trim()
		.custom((v) => {
			if (String(v).trim() === "") {
				throw new Error("Username is required");
			}
			return true;
		})
		.isLength({ min: 3, max: 100 })
		.withMessage("Username length must be 3–100 characters"),
	body("password")
		.trim()
		.optional({ checkFalsy: true })
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters"),
	body("first_name")
		.optional()
		.trim()
		.custom((v) => {
			if (String(v).trim() === "") {
				throw new Error("First name is required");
			}
			return true;
		})
		.isLength({ max: 100 })
		.withMessage("Max first name length is 100 characters"),
	body("last_name")
		.optional()
		.trim()
		.custom((v) => {
			if (String(v).trim() === "") {
				throw new Error("Last name is required");
			}
			return true;
		})
		.isLength({ max: 100 })
		.withMessage("Max last name length is 100 characters"),
	body("gender")
		.optional()
		.isIn(["male", "female"])
		.withMessage("Invalid gender value"),
	body("birthdate")
		.optional()
		.custom((v) => {
			if (String(v).trim() === "") {
				throw new Error("Birthdate is required");
			}
			return true;
		})
		.isISO8601()
		.withMessage("Invalid birthdate (YYYY-MM-DD)"),
];
