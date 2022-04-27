const Users = require("./Users");
const toMs = require("ms");
const { user_db } = process.env;

const limitMap = {
	drakath: 200,
	nulgath: 500,
	artix: 999,
};

function print(message) {
	console.log("[PremDB] " + message);
}

class Premium extends Users {
	addPremium(id, expire, type) {
		if (!id) return print(`'id' empty`);
		if (!type || typeof type !== "string") {
			print(TypeError(`'type' is ${typeof type}. 'type' must be a string`));
			return false;
		}
		let data = this.getUser(id);
		if (!data) return;
		this.editUser(id, { premium: true, expire: Date.now() + toMs(expire), limit: data.limit + limitMap[type], type });
		print(`Success adding '${id}' to premium`);
		this.writeToFile(`./event/database/users/${user_db}`);
		return true;
	}
	deletePremium(id) {
		if (!id) return print("'id' empty");
		let data = this.getUser(id);
		if (!data) return;
		this.editUser(id, { premium: false, expire: null, limit: 20, type: null });
		print(`Success delete '${id}' from premium`);
		this.writeToFile(`./event/database/users/${user_db}`);
		return true;
	}
	checkPremium(id) {
		if (!id) return print(`'id' empty`);
		let status = false;
		let data = {};
		let allData = this.toArray();
		for (let dbX of allData) {
			if (dbX.id === id) {
				status = true;
				data = dbX;
			}
		}
		return { status, ...data };
	}
	getAllPremium() {
		let premiumUsers = [];
		let allData = this.toArray();
		for (let dbX of allData) {
			if (dbX.premium) {
				premiumUsers.push(dbX);
			}
		}
		return premiumUsers;
	}
}

module.exports = Premium;
