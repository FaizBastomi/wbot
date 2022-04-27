const Users = require("../../event/database/Users");
const moment = require("moment-timezone");
const { timezone } = require("../../config.json");
const user = new Users();

module.exports = {
	name: "allprem",
	owner: true,
	category: "private",
	alias: ["listprem"],
	desc: "Check all user and filter premium user",
	async exec({ msg }) {
		const allData = user.toArray();
		let str = "*All User List*\n\n",
			premium = [],
			basic = [];
		// filter
		allData.forEach((data) => {
			if (data.premium) {
				premium.push(data);
			} else {
				basic.push(data);
			}
		});

		str +=
			`*Premium*\n${premium
				.map(
					(data) =>
						`*ID:* wa.me/${data.id.split("@")[0]}\n*Tier:* ${data.type}\n*Expire:* ${moment(data.expire)
							.tz(timezone)
							.format("lll")}\n`
				)
				.join("\n")}\n` +
			`*Basic*\n${basic
				.map((data) => `*ID:* wa.me/${data.id.split("@")[0]}\n*Limit:* ${data.limit}\n`)
				.join("\n")}`;
		await msg.reply(str);
	},
};
