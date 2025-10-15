"use strict";
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

/**
 * Seeder: generate N regular (non-admin) users.
 * Uses SQLite via Sequelize CLI configuration.
 */
module.exports = {
	/**
	 * @function up
	 * @param {import('sequelize-cli').QueryInterface} queryInterface
	 * @param {import('sequelize').Sequelize} Sequelize
	 */
	async up(queryInterface, Sequelize) {
		const users = [];
		const COUNT = Number(process.env.SEED_USERS_COUNT || "200");

		const STATIC_PASSWORD_HASH = await bcrypt.hash("secret1", 12);

		for (let i = 0; i < COUNT; i++) {
			const gender = faker.person.sex();
			const firstName = faker.person.firstName(gender);
			const lastName = faker.person.lastName(gender);
			const birthdate = faker.date.past({
				years: faker.number.int({ min: 18, max: 60 }),
			});
			const rnd = faker.number.int({ min: 1000, max: 999999 });
			const username = `${faker.internet.username({ firstName, lastName })}_${rnd}`;
			users.push({
				username,
				password_hash: STATIC_PASSWORD_HASH,
				first_name: firstName,
				last_name: lastName,
				gender,
				birthdate,
				is_admin: false,
				created_at: new Date(),
				updated_at: new Date(),
			});
		}

		await queryInterface.bulkInsert("users", users);
	},

	/**
	 * @function down
	 * @param {import('sequelize-cli').QueryInterface} queryInterface
	 * @param {import('sequelize').Sequelize} Sequelize
	 */
	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("users", { is_admin: false });
	},
};
