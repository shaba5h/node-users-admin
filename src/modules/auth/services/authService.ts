import bcrypt from "bcrypt";
import { User } from "../../../db/models/user";

export async function authenticateUser(
	username: string,
	password: string,
): Promise<User | null> {
	const user = await User.findOne({ where: { username } });
	if (!user) return null;
	const ok = await bcrypt.compare(password, user.password_hash);
	return ok ? user : null;
}
