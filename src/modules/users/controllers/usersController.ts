import type { Request, Response } from "express";
import { ValidationError } from "sequelize";
import {
	createUser,
	deleteUser,
	getUserById,
	listUsers,
	updateUser,
} from "../services/userService";
import { validationResult, matchedData } from "express-validator";
import { DuplicateUsernameError } from "../repositories/usersRepository";

type UsersPageKind = "list" | "create" | "edit" | "show";

function baseBreadcrumbs() {
	return [
		{ title: "Home", url: "/", icon: "fas fa-home" },
		{ title: "Users", url: "/admin/users" },
	];
}

function usersMeta(kind: UsersPageKind, payload?: any) {
	switch (kind) {
		case "list":
			return {
				title: "Users",
				pageTitle: "User Management",
				currentPage: "users-list",
				breadcrumbs: baseBreadcrumbs(),
				pageActions: `
          <a href="/admin/users/new" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Add User
          </a>
        `,
			};
		case "create":
			return {
				title: "New User",
				pageTitle: "Create User",
				currentPage: "users-form",
				breadcrumbs: [...baseBreadcrumbs(), { title: "Create" }],
			};
		case "edit":
			return {
				title: "Edit User",
				pageTitle: "Edit User",
				currentPage: "users-form",
				breadcrumbs: [...baseBreadcrumbs(), { title: "Edit" }],
			};
		case "show": {
			const user = payload?.user;
			const fullName = user ? `${user.first_name} ${user.last_name}` : "User";
			return {
				title: fullName,
				pageTitle: `User profile: ${fullName}`,
				currentPage: "users-show",
				breadcrumbs: [...baseBreadcrumbs(), { title: fullName }],
				pageActions: user
					? `<a href="/admin/users/${user.id}/edit" class="btn btn-primary"><i class="fas fa-edit"></i> Edit</a> <button type="button" class="btn btn-danger btn-delete-user" data-user-id="${user.id}" data-user-name="${fullName}"><i class="fas fa-trash"></i> Delete</button>`
					: undefined,
			};
		}
	}
}

function renderUsersPage(
	res: Response,
	kind: UsersPageKind,
	view: string,
	payload: Record<string, any>,
) {
	const meta = usersMeta(kind, payload);
	const common = {
		additionalJS: ["/public/js/users.js"],
	};
	const mode =
		kind === "create" ? "create" : kind === "edit" ? "edit" : undefined;
	res.render(view, {
		...common,
		...meta,
		...payload,
		...(mode ? { mode } : {}),
	});
}

/**
 * Build a flat map of validation errors from express-validator.
 */
function buildErrorMap(req: Request): Record<string, string> {
	const result = validationResult(req);
	return result.isEmpty()
		? {}
		: Object.fromEntries(
				Object.entries(result.mapped()).map(([k, v]) => [k, v.msg]),
			);
}

/**
 * Extract and normalize query parameters used on users index page.
 */
function getIndexQuery(req: Request): {
	page: number;
	sortBy: "username" | "full_name" | "birthdate";
	sortDir: "asc" | "desc";
	q: string;
} {
	const data = matchedData(req, {
		locations: ["query"],
		includeOptionals: true,
	});
	const page = Number(data.page ?? 1);
	const sortBy = (data.sortBy ?? "username") as
		| "username"
		| "full_name"
		| "birthdate";
	const sortDir = (data.sortDir ?? "asc") as "asc" | "desc";
	const q = (data.q ?? "").trim();
	return { page, sortBy, sortDir, q };
}

/**
 * Extract sanitized user form payload from request body.
 */
function getUserFormBody(req: Request): {
	username?: string;
	password?: string;
	first_name?: string;
	last_name?: string;
	gender?: string;
	birthdate?: string;
} {
	return matchedData(req, {
		locations: ["body"],
		includeOptionals: true,
	}) as any;
}

/**
 * Render users index with pagination, sorting and filtering.
 */
export async function renderUsersIndex(
	req: Request,
	res: Response,
): Promise<void> {
	const pageSize = 10;
	const { page, sortBy, sortDir, q } = getIndexQuery(req);
	const { users, count } = await listUsers(page, pageSize, {
		sortBy,
		sortDir,
		q,
	});
	const totalPages = Math.ceil(count / pageSize);
	const errors = buildErrorMap(req);
	renderUsersPage(res, "list", "users/index", {
		users,
		page,
		totalPages,
		sortBy,
		sortDir,
		q,
		errors,
	});
}

/**
 * Render user creation form.
 */
export async function renderNewUserForm(
	req: Request,
	res: Response,
): Promise<void> {
	renderUsersPage(res, "create", "users/form", {
		user: null,
		errors: {},
		csrfToken: req.csrfToken(),
	});
}

/**
 * Handle user creation.
 * - Validates input
 * - Persists a new user
 * - Handles friendly errors
 */
export async function createUserHandler(
	req: Request,
	res: Response,
): Promise<void> {
	const errors = buildErrorMap(req);
	if (Object.keys(errors).length > 0) {
		const vals = getUserFormBody(req);
		return (
			res.status(422),
			renderUsersPage(res, "create", "users/form", {
				user: vals,
				errors,
			})
		);
	}

	const vals = getUserFormBody(req);
	const payload = {
		username: vals.username as string,
		password: vals.password as string,
		first_name: vals.first_name as string,
		last_name: vals.last_name as string,
		gender: vals.gender as "male" | "female",
		birthdate: vals.birthdate as string,
	};
	try {
		await createUser(payload);
		res.redirect("/admin/users");
	} catch (err: any) {
		if (err instanceof DuplicateUsernameError) {
			return (
				res.status(400),
				renderUsersPage(res, "create", "users/form", {
					user: vals,
					errors: { username: "A user with this username already exists" },
				})
			);
		}
		const message =
			err instanceof ValidationError
				? "Failed to create user"
				: err?.message || "Failed to create user";
		return (
			res.status(400),
			renderUsersPage(res, "create", "users/form", {
				user: vals,
				errors: { global: message },
			})
		);
	}
}

/**
 * Render user details page.
 */
export async function renderUserShow(
	req: Request,
	res: Response,
): Promise<void> {
	const id = Number(req.params.id);
	const user = await getUserById(id);
	if (!user) {
		res.status(404).send("User not found");
		return;
	}
	renderUsersPage(res, "show", "users/show", { user });
}

/**
 * Render user edit form.
 */
export async function renderEditUserForm(
	req: Request,
	res: Response,
): Promise<void> {
	const id = Number(req.params.id);
	const user = await getUserById(id);
	if (!user) {
		res.status(404).send("User not found");
		return;
	}
	renderUsersPage(res, "edit", "users/form", {
		user,
		errors: {},
		csrfToken: req.csrfToken(),
	});
}

/**
 * Handle user update.
 * - Validates input
 * - Updates an existing user
 * - Provides friendly error messages
 */
export async function updateUserHandler(
	req: Request,
	res: Response,
): Promise<void> {
	const id = Number(req.params.id);
	const exists = await getUserById(id);
	if (!exists) {
		res.status(404).send("User not found");
		return;
	}

	const errors = buildErrorMap(req);
	if (Object.keys(errors).length > 0) {
		const vals = getUserFormBody(req);
		return (
			res.status(422),
			renderUsersPage(res, "edit", "users/form", {
				user: { id, ...vals },
				errors,
			})
		);
	}

	const vals = getUserFormBody(req);
	const payload = {
		username: vals.username,
		password: vals.password,
		first_name: vals.first_name as string | undefined,
		last_name: vals.last_name as string | undefined,
		gender: vals.gender as "male" | "female" | undefined,
		birthdate: vals.birthdate as string | undefined,
	};
	try {
		const user = await updateUser(id, payload);
		if (!user) {
			res.status(404).send("User not found");
			return;
		}
		res.redirect("/admin/users");
	} catch (err: any) {
		if (err instanceof DuplicateUsernameError) {
			return (
				res.status(400),
				renderUsersPage(res, "edit", "users/form", {
					user: { id, ...vals },
					errors: { username: "A user with this username already exists" },
				})
			);
		}
		return (
			res.status(400),
			renderUsersPage(res, "edit", "users/form", {
				user: { id, ...vals },
				errors: { global: err?.message || "Failed to save user" },
			})
		);
	}
}

/**
 * Handle user delete.
 */
export async function deleteUserHandler(
	req: Request,
	res: Response,
): Promise<void> {
	const id = Number(req.params.id);
	const ok = await deleteUser(id);
	if (!ok) {
		res.status(404).send("User not found");
		return;
	}
	res.redirect("/admin/users");
}
