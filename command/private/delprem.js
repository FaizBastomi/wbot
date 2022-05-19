const Prem = require("../../event/database/Premium");
const user = new Prem();
const { user_db } = require("../../config.json");

module.exports = {
	name: "delprem",
	category: "private",
	desc: "delete someone from premium database",
	owner: true,
	use:
		"<number>\n\n*number* - can accept multi id, seperate with comma\n" +
		"Example: #addprem 6281111111111,6281122222222",
	async exec({ msg, args }) {
		const { mentions } = msg;
		if (!args.length) return await msg.reply("Please see #help addprem");
		let number = args.join(" ").split(","),
			valid = [];

		if (mentions) {
			mentions.forEach((i) => {
				if (!user.getUser(i)) return console.log(`'${i}' not in database, ignoring`);
				user.deletePremium(i);
			});
			user.writeToFile(user_db);
			await msg.reply(`Success delete ${mentions.length} user(s) from premium`);
		} else if (number.length >= 1) {
			number.forEach((i) => {
				i = i.replace(/\D/g, "");
				if (/[0-9]{3,20}/gi.test(i)) {
					let id = i + "@s.whatsapp.net",
						userData = user.getUser(id);
					if (!userData.premium || !userData) return console.log(`'${id}' not in premium database, ignoring`);
					valid.push(i);
					user.deletePremium(id);
				} else {
					console.log(`'${id}' not a valid WhatsApp number`);
				}
			});
			user.writeToFile(user_db);
			await msg.reply(`Success delete ${valid.length} user(s) from premium`);
		} else {
			await msg.reply("Please provide user number");
		}
	},
};
