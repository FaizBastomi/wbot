const Prem = require("../../event/database/Premium");
const user = new Prem();

module.exports = {
	name: "limit",
	alias: ["ceklimit", "checklimit"],
	category: "information",
	async exec({ msg }) {
		let userData = user.getUser(msg.sender);
		if (userData) {
			let txt = `*Account Type:* ${userData.type ? userData.type : "basic"}\n*Remaining Limit:* ${
				userData.limit
			}`;
			await msg.reply(txt);
		}
	},
};
