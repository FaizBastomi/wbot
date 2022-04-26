const { wiki } = require("../../utils");

module.exports = {
	name: "wiki",
	limit: true,
	consume: 2,
	alias: ["wk"],
	desc: "Search on Wikipedia\nLang: id and en",
	use: "[en|id] <query>",
	category: "information",
	async exec({ msg, args }) {
		if (!args.length > 0) return await msg.reply("No query given to search");
		try {
			const lang = args[0];
			switch (lang) {
				case "en": {
					let text = await wiki(args.slice(1).join(" "), "en");
					await msg.reply(text);
					break;
				}
				case "id": {
					let text = await wiki(args.slice(1).join(" "), "id");
					await msg.reply(text);
					break;
				}
				default:
					let text = await wiki(args.join(" "), "id");
					await msg.reply(text);
					break;
			}
		} catch {
			await msg.reply("Something bad happend");
		}
	},
};
