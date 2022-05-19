const Users = require("./Users");
const toMs = require("ms");
const { color } = require("../../utils");
const { user_db, tier } = require("../../config.json");

function print(message) {
	console.log(color("[PremDB]", "yellow"), message);
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
		this.editUser(id, {
			premium: true,
			expire: Date.now() + toMs(expire),
			limit: data.limit + tier[type],
			type,
			info: { ...data.info },
		});
		print(`Success adding '${id}' to premium`);
		return true;
	}
	deletePremium(id) {
		if (!id) return print("'id' empty");
		let data = this.getUser(id);
		if (!data) return;
		this.editUser(id, {
			premium: false,
			expire: null,
			limit: 50,
			type: null,
			info: { ...data.info },
		});
		print(`Success delete '${id}' from premium`);
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
