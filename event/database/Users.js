const { promises, existsSync } = require("fs");
const { join, basename } = require("path");
const { Collection } = require("../../lib/Collection");
const { color } = require("../../utils");
const usersMap = new Collection();

function print(message) {
	console.log(color("[UserDB]", "yellow"), message);
}

class Users {
	addUser(id) {
		if (!id || typeof id !== "string") {
			print(TypeError(`'id' is ${typeof id}. 'id' must be a string`));
		}
		if (usersMap.has(id)) return print(`ignoring: '${id}' already in database`);
		try {
			let data = {
				id,
				premium: false,
				expire: null,
				limit: 50,
				type: null,
				info: { age: null, adult: false },
			};
			usersMap.set(id, data);
			return true;
		} catch (e) {
			throw e;
		}
	}
	deleteUser(id) {
		if (!usersMap.has(id)) {
			return false;
		}
		try {
			usersMap.delete(id);
			return true;
		} catch (e) {
			throw e;
		}
	}
	editUser(
		id,
		data = {
			premium: false,
			expire: null,
			limit: 0,
			type: null,
			info: { age: null, adult: false },
		}
	) {
		if (!usersMap.has(id)) {
			return false;
		}
		try {
			data = { id, ...data };
			usersMap.set(id, data);
			return true;
		} catch (e) {
			throw e;
		}
	}
	getUser(id) {
		if (!usersMap.has(id)) {
			return false;
		}
		return usersMap.get(id);
	}
	toArray() {
		return Array.from(usersMap.values());
	}
	async writeToFile(filename) {
		let $path = join(__dirname, "users", filename ? filename : "users-db.json");
		if (!filename) print(`'filename' is empty defaulting to '${basename($path)}'`);
		await promises.writeFile($path, JSON.stringify(this.toArray(usersMap), null, "\t"));
		print("write user db to: " + $path);
	}
	async readFromFile(filename) {
		let $path = join(__dirname, "users", filename ? filename : "users-db.json");
		if (existsSync($path)) {
			print("read user db from: " + $path);
			const dbStr = await promises.readFile($path, { encoding: "utf-8" });
			const dbJson = JSON.parse(dbStr);
			if (Array.isArray(dbJson)) {
				for (let dbX of dbJson) {
					usersMap.set(dbX.id, dbX);
				}
			}
		}
	}
}

module.exports = Users;
