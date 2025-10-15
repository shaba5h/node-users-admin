import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../config/db";

export interface UserAttributes {
	id: number;
	username: string;
	password_hash: string;
	first_name: string;
	last_name: string;
	gender: "male" | "female";
	birthdate: Date;
	is_admin: boolean;
	created_at: Date;
	updated_at: Date;
}

export type UserCreationAttributes = Optional<
	UserAttributes,
	| "id"
	| "first_name"
	| "last_name"
	| "gender"
	| "birthdate"
	| "created_at"
	| "updated_at"
>;

export class User
	extends Model<UserAttributes, UserCreationAttributes>
	implements UserAttributes
{
	public id!: number;
	public username!: string;
	public password_hash!: string;
	public first_name!: string;
	public last_name!: string;
	public gender!: "male" | "female";
	public birthdate!: Date;
	public is_admin!: boolean;
	public readonly created_at!: Date;
	public readonly updated_at!: Date;
}

export function initUserModel(): void {
	User.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			username: {
				type: DataTypes.STRING(100),
				allowNull: false,
				unique: true,
				validate: {
					len: [3, 100],
				},
			},
			password_hash: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			first_name: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			last_name: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			gender: {
				type: DataTypes.ENUM("male", "female"),
				allowNull: false,
			},
			birthdate: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			is_admin: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			created_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
			updated_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			tableName: "users",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			indexes: [
				{ unique: true, fields: ["username"], name: "users_username_unique" },
				{ fields: ["birthdate"], name: "users_birthdate_idx" },
				{
					fields: ["first_name", "last_name"],
					name: "users_full_name_order_idx",
				},
			],
		},
	);
}
