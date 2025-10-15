"use strict";

module.exports = {
	/**
	 * @function up
	 * Insert an admin user if not present.
	 * @param {import('sequelize-cli').QueryInterface} queryInterface
	 * @param {import('sequelize').Sequelize} Sequelize
	 */
	async up(queryInterface, Sequelize) {
		const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
		const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
		const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || "Admin";
		const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || "User";
		const ADMIN_GENDER_RAW = (process.env.ADMIN_GENDER || "male").toLowerCase();
		const ADMIN_GENDER = ADMIN_GENDER_RAW === "female" ? "female" : "male";
		const ADMIN_BIRTHDATE_RAW = process.env.ADMIN_BIRTHDATE || "1990-01-01";
		let ADMIN_BIRTHDATE = new Date(ADMIN_BIRTHDATE_RAW);

		if (Number.isNaN(ADMIN_BIRTHDATE.getTime())) {
			console.warn(
				`Invalid ADMIN_BIRTHDATE='${ADMIN_BIRTHDATE_RAW}', falling back to 1990-01-01`,
			);
			ADMIN_BIRTHDATE = new Date("1990-01-01");
		}

		const bcrypt = require("bcrypt");
		const HASH = await bcrypt.hash(ADMIN_PASSWORD, 12);

		// Check if admin already exists.
		const [results] = await queryInterface.sequelize.query(
			"SELECT id FROM users WHERE username = :username LIMIT 1",
			{ replacements: { username: ADMIN_USERNAME } },
		);

		if (Array.isArray(results) && results.length > 0) {
			return;
		}

		await queryInterface.bulkInsert("users", [
			{
				username: ADMIN_USERNAME,
				password_hash: HASH,
				first_name: ADMIN_FIRST_NAME,
				last_name: ADMIN_LAST_NAME,
				gender: ADMIN_GENDER,
				birthdate: ADMIN_BIRTHDATE,
				is_admin: true,
				created_at: new Date(),
				updated_at: new Date(),
			},
		]);
	},

	/**
	 * @function down
	 * Remove the admin user created by this seeder.
	 * @param {import('sequelize-cli').QueryInterface} queryInterface
	 * @param {import('sequelize').Sequelize} Sequelize
	 */
	async down(queryInterface, Sequelize) {
		const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
		await queryInterface.bulkDelete("users", { username: ADMIN_USERNAME });
	},
};
