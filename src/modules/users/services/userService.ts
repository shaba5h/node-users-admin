import bcrypt from "bcrypt";
import {
	findAll as repoFindAll,
	findById as repoFindById,
	create as repoCreate,
	update as repoUpdate,
	destroy as repoDestroy,
} from "../repositories/usersRepository";
import type { UserCreationAttributes } from "../../../db/models/user";

const BCRYPT_COST = 12;

/**
 * List users with pagination, sorting and text filter.
 */
export async function listUsers(
	page: number,
	pageSize: number,
	options?: {
		sortBy?: "username" | "full_name" | "birthdate";
		sortDir?: "asc" | "desc";
		q?: string;
	},
) {
	const allowedSort: Array<"username" | "full_name" | "birthdate"> = [
		"username",
		"full_name",
		"birthdate",
	];
	const sortBy =
		options?.sortBy && allowedSort.includes(options.sortBy)
			? options.sortBy
			: "username";
	const sortDir: "ASC" | "DESC" = options?.sortDir === "desc" ? "DESC" : "ASC";
	const q = (options?.q || "").trim();

	const { rows, count } = await repoFindAll({
		page,
		limit: pageSize,
		sort: sortBy,
		order: sortDir,
		filter: q || null,
		extraWhere: { is_admin: false },
	});
	return { users: rows, count };
}

/**
 * Fetch a user by ID.
 * Admin users are hidden.
 */
export async function getUserById(id: number) {
	const user = await repoFindById(id);
	if (user?.is_admin) return null;
	return user;
}

export async function createUser(data: {
	username: string;
	password: string;
	first_name: string;
	last_name: string;
	gender: "male" | "female";
	birthdate: string;
}) {
	// Validate required fields strictly at service level to prevent incomplete creations from any entry point
	if (!data.username || !data.password) {
		throw new Error("Missing username or password");
	}
	if (!data.first_name || !data.last_name) {
		throw new Error("Missing first_name or last_name");
	}
	if (!["male", "female"].includes(data.gender)) {
		throw new Error("Invalid gender");
	}
	if (!data.birthdate || Number.isNaN(Date.parse(data.birthdate))) {
		throw new Error("Invalid birthdate");
	}
	const hash = await bcrypt.hash(data.password, BCRYPT_COST);
	const payload: Partial<UserCreationAttributes> = {
		username: data.username,
		password_hash: hash,
		first_name: data.first_name,
		last_name: data.last_name,
		gender: data.gender,
		birthdate: new Date(data.birthdate),
		is_admin: false,
	};
	return repoCreate(payload as UserCreationAttributes);
}

/**
 * Update an existing user
 * Do not allow admin users to be updated.
 */
export async function updateUser(
	id: number,
	data: {
		username?: string | null;
		password?: string | null;
		first_name?: string | null;
		last_name?: string | null;
		gender?: "male" | "female" | null;
		birthdate?: string | null;
	},
) {
	const user = await repoFindById(id);
	if (!user) return null;
	if (user.is_admin) return null;

	if (data.username !== undefined && data.username !== null) {
		user.username = data.username;
	}
	if (data.first_name !== undefined) {
		user.first_name = data.first_name === null ? "" : data.first_name;
	}
	if (data.last_name !== undefined) {
		user.last_name = data.last_name === null ? "" : data.last_name;
	}
	if (data.gender !== undefined && data.gender !== null) {
		user.gender = data.gender;
	}
	if (data.birthdate !== undefined) {
		if (data.birthdate !== null) {
			const v = data.birthdate.trim();
			if (v) {
				user.birthdate = new Date(v);
			}
		}
	}

	if (data.password && data.password.length > 0) {
		user.password_hash = await bcrypt.hash(data.password, BCRYPT_COST);
	}
	await repoUpdate(user);
	return user;
}

/**
 * Delete a user by ID.
 * Admin users cannot be deleted.
 */
export async function deleteUser(id: number) {
	const user = await repoFindById(id);
	if (!user) return false;
	if (user.is_admin) return false;
	await repoDestroy(user);
	return true;
}
