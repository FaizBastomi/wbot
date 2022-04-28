const nhentai = require("nhentai-js");

module.exports = {
	name: "nuke",
	limit: true,
	consume: 5,
	premium: true,
	premiumType: ["nulgath", "artix"],
	alias: ["nhentai", "ncode"],
	category: "weebs",
	use: "<nuke code>",
	async exec({ sock, msg, args }) {
		const { from, isGroup } = msg;
		if (isGroup) return await msg.reply("Can't use this command inside the group.");
		try {
			let opt = args[0],
				data = null;
			switch (opt) {
				default:
					data = await getCode(args[0]);
					await sock.sendMessage(from, {
						image: { url: data.image },
						caption: data.data,
						templateButtons: [
							{ urlButton: { displayText: "View Online", url: `http://hiken.xyz/v/${args[0]}` } },
							{ urlButton: { displayText: "Download", url: `http://hiken.xyz/g/${args[0]}` } },
							{ quickReplyButton: { displayText: "Get Link", id: `!nuke code ${args[0]}` } },
						],
					});
			}
		} catch (e) {
			await msg.reply(`Error:${e.message}`);
		}
	},
};

async function getCode(code) {
	if (nhentai.exists(code)) {
		let doujin = await nhentai.getDoujin(code);
		let text =
			`*📕Title:* ${doujin.title}\n*📚tags:* ${doujin.details?.tags
				?.map((v) => `${v.split(" (")[0]}`)
				?.join(", ")}\n` +
			`*👤Artist(s):* ${doujin.details?.artists
				?.map((v) => `${v.split(" (")[0]}`)
				?.join(", ")}\n*🌐Language(s):* ${doujin.details?.languages
				?.map((v) => `${v.split(" (")[0]}`)
				?.join(", ")}\n` +
			`*🔖Categories:* ${doujin.details?.categories?.map((v) => `${v.split(" (")[0]}`)?.join(", ")}\n*🔱Pages:* ${
				doujin.details?.pages[0]
			}\n*📢Upload:* ${doujin.details?.uploaded[0]}`;
		return { data: text, image: doujin.pages[0] };
	} else {
		throw "Code doesn't exist";
	}
}
