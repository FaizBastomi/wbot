const { memeText } = require("../../utils/uploader");
const { sticker } = require("../../lib/convert");
const lang = require("../other/text.json");

module.exports = {
	name: "stikmeme",
	limit: true,
	consume: 3,
	alias: ["stickermeme", "stikermeme", "stiktext", "stickertext", "stikertext", "sticktext", "smeme", "stext"],
	category: "general",
	desc: "Create a sticker from image",
	async exec({ msg, arg, sock }) {
		const { quoted, from, type } = msg;

		const content = JSON.stringify(quoted);
		const isMedia = type === "imageMessage";
		const isQImg = type === "extendedTextMessage" && content.includes("imageMessage");
		const isQDoc = type === "extendedTextMessage" && content.includes("documentMessage");
		let top = arg.split("|")[0] || "_";
		let bottom = arg.split("|")[1] || "_";

		let buffer, memeImg, stickerBuff;
		try {
			if ((isMedia && !msg.message.videoMessage) || isQImg) {
				buffer = isQImg ? await quoted.download() : await msg.download();
				memeImg = await memeText(buffer, top.toString(), bottom.toString());
				stickerBuff = await sticker(memeImg, { isImage: true, cmdType: "1" });
				await sock.sendMessage(from, { sticker: stickerBuff }, { quoted: msg });
			} else if (isQDoc && /image/.test(quoted.message.documentMessage.mimetype)) {
				buffer = await quoted.download();
				memeImg = await memeText(buffer, top, bottom);
				stickerBuff = await sticker(memeImg, { isImage: true, cmdType: "1" });
				await sock.sendMessage(from, { sticker: stickerBuff }, { quoted: msg });
			} else {
				await msg.reply(`IND:\n${lang.indo.stickmeme}\n\nEN:\n${lang.eng.stickmeme}`);
			}
			(buffer = null), (memeImg = null), (stickerBuff = null);
		} catch (e) {
			await msg.reply("Error while creating sticker");
		}
	},
};
