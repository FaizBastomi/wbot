const Downloader = require("../../utils/downloader");
const { yts } = new Downloader();

module.exports = {
	name: "yts",
	alias: ["ytsearch"],
	category: "downloader",
	desc: "Search on YouTube.",
	async exec({ sock, msg, args }) {
		if (args.length < 1) return await msg.reply("No query given to search.");
		const ytsData = await yts(args.join(" "), "long");
		let txt = `YouTube Search\n   ~> Query: ${args.join(" ")}\n`;
		for (let i = 0; i < ytsData.length; i++) {
			txt += `\n📙 Title: ${ytsData[i].title}\n📎 Url: ${ytsData[i].url}\n🚀 Upload: ${ytsData[i].ago}\n`;
		}
		await sock.sendMessage(msg.from, { image: { url: ytsData[0].image }, caption: txt }, { quoted: msg });
	},
};
