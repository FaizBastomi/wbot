const Prem = require("../../event/database/Premium");
const user = new Prem();

module.exports = {
	name: "addprem",
	category: "private",
	desc: "add someone number to premium database",
	owner: true,
	use:
		"<number>|<expired>|<type>\n\n*number* - can accept multi id, seperate with comma\n" +
		"*expired* - expire in day\n*type* - premium type (drakath|nulgath|artix)\n\n" +
		"Example: #addprem 6281111111111,6281122222222|30d|nulgath",
	async exec({ msg, args, arg }) {
		const { mentions } = msg;
		if (!args.length >= 1) return await msg.reply("Please see #help addprem");
		let number = arg.split("|")[0]?.split(","),
			expire = arg.split("|")[1],
			type = arg.split("|")[2],
			valid = [];

		if (mentions) {
			mentions.forEach((i) => {
				if (!user.getUser(i)) user.addUser(i);
				user.addPremium(i, expire, type);
			});
			await msg.reply(`Success add ${mentions.length} user(s) to premium`);
		} else if (number.length >= 1) {
			number.forEach((i) => {
				i = i.replace(/\D/g, "");
				if (/[0-9]{3,20}/gi.test(i)) {
					valid.push(i);
					let id = i + "@s.whatsapp.net";
					if (!user.getUser(id)) user.addUser(id);
					user.addPremium(id, expire, type);
				} else {
					console.log(`'${i}' not a valid WhatsApp number`);
				}
			});
			await msg.reply(`Success add ${valid.length} user(s) to premium`);
		} else {
			await msg.reply("Please provide user number");
		}
	},
};
