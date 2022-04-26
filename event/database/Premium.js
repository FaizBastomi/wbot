const Users = require("./Users");
const toMs = require("ms");

const limitMap = {
	basic: 100,
	support: 500,
	vip: Infinity,
};

class Premium extends Users {
	constructor() {}
	addPremium(id, expire, type) {
		if (!id) return this.print(`'id' empty`);
		if (!type || typeof type !== "string") {
			this.print(TypeError(`'type' is ${typeof type}. 'type' must be a string`));
			return false;
		}
		let data = this.getUser(id);
		if (!data) return;
		this.editUser(id, { premium: true, expire: Date.now() + toMs(expire), limit: data.limit + limitMap[type], type });
		return true;
	}
	checkPremium(id) {
		if (!id) return this.print(`'id' empty`);
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
}

module.exports = Premium;
