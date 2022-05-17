const Prem = require("../../event/database/Premium");
const user = new Prem();
const { tier } = require("../../config.json");

module.exports = {
	name: "addprem",
	category: "private",
	desc: "add someone number to premium database",
	owner: true,
	use:
		"<expire> <number> <tier>\n\n*number* - can accept multi id\n" +
		`*expire* - expire in day (4 digits)\n*tier* - tier type (${Object.keys(tier).join("|")})\n\n` +
		"Example: #addprem 30d +62 81-1111-1111 +62 82-2222-2222 drakath",
	async exec({ msg, args, arg }) {
		const { mentions } = msg;
		if (!args.length >= 1) return await msg.reply("Please see #help addprem");
		let raw = args.join(" "),
			number = raw.match(/\+([\d ()-]{3,16})/g),
			expire = raw.match(/([\d]{1,4})d/g),
			type = raw.match(/(?:drakath|nulgath|artix)/g),
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
				if (/[0-9]{3,16}/gi.test(i)) {
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
