"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("users", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			username: {
				type: Sequelize.STRING(100),
				allowNull: false,
				unique: true,
			},
			password_hash: {
				type: Sequelize.STRING(255),
				allowNull: false,
			},
			first_name: {
				type: Sequelize.STRING(100),
				allowNull: false,
			},
			last_name: {
				type: Sequelize.STRING(100),
				allowNull: false,
			},
			gender: {
				type: Sequelize.ENUM("male", "female"),
				allowNull: false,
			},
			birthdate: {
				type: Sequelize.DATEONLY,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_DATE"),
			},
			is_admin: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});
		await queryInterface.addIndex("users", ["username"], {
			unique: true,
			name: "users_username_unique",
		});
		await queryInterface.addIndex("users", ["birthdate"], {
			name: "users_birthdate_idx",
		});
		await queryInterface.addIndex("users", ["first_name", "last_name"], {
			name: "users_full_name_order_idx",
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("users");
	},
};
