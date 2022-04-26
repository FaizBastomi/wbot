const parse = require("parse-ms");
const Prem = require("../../event/database/Premium");
const user = new Prem();

module.exports = {
	name: "checkprem",
	alias: ["cekprem", "checkpremium", "cekpremium"],
	category: "information",
	premium: true,
	premiumType: ["drakath", "nulgath", "artix"],
	async exec({ msg }) {
		let userData = user.getUser(msg.sender);
		if (userData) {
			let parsed = parse(userData.expire - Date.now());
			let text =
				`*Expired:* ${parsed.days} day(s) ${parsed.hours} hour(s) ${parsed.minutes} minute(s)` +
				`\n*Limit:* ${userData.limit}\n*type:* ${userData.type}`;
			await msg.reply(text);
		}
	},
};
