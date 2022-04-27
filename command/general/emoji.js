const { fetchBuffer } = require("../../utils");
const { emojiped } = require("../../utils/scraper");
const { sticker } = require("../../lib/convert");

module.exports = {
	name: "moji",
	limit: true,
	consume: 2,
	premium: true,
	premiumType: ["nulgath", "artix"],
	alias: ["emoji"],
	desc: "Convert emoji to sticker.",
	category: "general",
	use: "[provider] <emoji>\n\nProvider:\n- WhatsApp\n- Samsung\n- Apple\n- Google",
	async exec({ sock, msg, args }) {
		const { from } = msg;

		let emojiBuff, stickerBuff;
		try {
			if (!args.length > 0) return await msg.reply("Need to specify emoji");
			if (args.length > 1 && args.length === 2) {
				const links = await emojiped(args.slice(1)[0]);
				let provider = Object.keys(links);
				if (provider.includes(args[0])) {
					emojiBuff = await fetchBuffer(links[args[0]]);
					stickerBuff = await sticker(emojiBuff, { isImage: true, cmdType: "2" });
					await sock.sendMessage(from, { sticker: stickerBuff }, { quoted: msg });
				} else {
					emojiBuff = await fetchBuffer(links.whatsapp);
					stickerBuff = await sticker(emojiBuff, { isImage: true, cmdType: "2" });
					await sock.sendMessage(from, { sticker: stickerBuff }, { quoted: msg });
				}
			} else {
				const links = await emojiped(args[0]);
				emojiBuff = await fetchBuffer(links.whatsapp);
				stickerBuff = await sticker(emojiBuff, { isImage: true, cmdType: "2" });
				await sock.sendMessage(from, { sticker: stickerBuff }, { quoted: msg });
			}
			(emojiBuff = null), (stickerBuff = null);
		} catch (e) {
			await msg.reply("Error while processing your emoji");
		}
	},
};
