import { Op, type WhereOptions, Sequelize } from "sequelize";
import { User } from "../../../db/models/user";

export class DuplicateUsernameError extends Error {
	constructor(message: string = "Duplicate username") {
		super(message);
		this.name = "DuplicateUsernameError";
	}
}

/**
 * Find users with pagination, sorting and optional text filter.
 */
export async function findAll({
	page,
	limit,
	sort,
	order,
	filter,
	extraWhere,
}: {
	page: number;
	limit: number;
	sort: "username" | "full_name" | "birthdate";
	order: "ASC" | "DESC";
	filter?: string | null;
	extraWhere?: WhereOptions;
}) {
	const textWhere = filter
		? {
				[Op.or]: [
					{ username: { [Op.like]: `%${filter}%` } },
					{ first_name: { [Op.like]: `%${filter}%` } },
					{ last_name: { [Op.like]: `%${filter}%` } },
				],
			}
		: undefined;

	let where: WhereOptions | undefined;
	if (extraWhere && textWhere) {
		where = { [Op.and]: [extraWhere, textWhere] } as WhereOptions;
	} else if (extraWhere) {
		where = extraWhere;
	} else if (textWhere) {
		where = textWhere;
	} else {
		where = undefined; // no constraints -> list all
	}

	const offset = (page - 1) * limit;
	const orderArray =
		sort === "full_name"
			? [
					["first_name", order],
					["last_name", order],
				]
			: [[sort as string, order]];

	const { rows, count } = await User.findAndCountAll({
		where,
		order: orderArray as any,
		limit,
		offset,
	});
	return { rows, count };
}

export async function findById(id: number) {
	return User.findByPk(id);
}

export async function create(payload: Partial<User>) {
	const existing = await User.findOne({
		where: { username: payload.username },
	});
	if (existing) {
		throw new DuplicateUsernameError();
	}
	return User.create(payload as any);
}

export async function update(user: User) {
	const existing = await User.findOne({
		where: { username: user.username },
	});
	if (existing && existing.id !== user.id) {
		throw new DuplicateUsernameError();
	}
	await user.save();
	return user;
}

export async function destroy(user: User) {
	await user.destroy();
}
