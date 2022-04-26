const Downloader = require("../../utils/downloader");
const { igProfile } = new Downloader();

module.exports = {
	name: "igstalk",
	limit: true,
	consume: 1,
	alias: ["igprofile"],
	category: "general",
	use: "<username>",
	async exec({ sock, msg, args }) {
		try {
			if (!args.length > 0) return await msg.reply("Instagram username required!");
			const profile = await igProfile(args[0]);
			let text = Object.keys(profile.metadata)
				.map((str) => `${str}: ${profile.metadata[str]}`)
				.join("\n");
			await sock.sendMessage(msg.from, { image: { url: profile.picUrl.hd }, caption: text }, { quoted: msg });
		} catch (e) {
			await msg.reply(`${e}`);
		}
	},
};
