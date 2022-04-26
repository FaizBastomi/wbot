const Exif = require("../../utils/exif");
const ex = new Exif();
const fs = require("fs");
const { getRandom } = require("../../utils");
const { sticker } = require("../../lib/convert");
const run = require("child_process").exec;
const lang = require("../other/text.json");

module.exports = {
	name: "swm",
	limit: true,
	consume: 2,
	alias: ["stickerwm", "stickwm", "stikerwm", "stikwm"],
	category: "general",
	desc: "Create sticker with author and packname",
	use: "packname|authorname",
	async exec({ msg, arg, sock }) {
		const { quoted, from, sender, type } = msg;
		let packname = arg.split("|")[0] || "Default";
		let author = arg.split("|")[1] || "SMH BOT";

		const content = JSON.stringify(quoted);
		const isMedia = type === "imageMessage" || type === "videoMessage";
		const isQImg = type === "extendedTextMessage" && content.includes("imageMessage");
		const isQVid = type === "extendedTextMessage" && content.includes("videoMessage");
		const isQStick = type === "extendedTextMessage" && content.includes("stickerMessage");
		const isQDoc = type === "extendedTextMessage" && content.includes("documentMessage");

		let buffer, stickerBuff;
		try {
			if ((isMedia && !msg.message.videoMessage) || isQImg) {
				buffer = isQImg ? await quoted.download() : await msg.download();
				stickerBuff = await sticker(buffer, {
					isImage: true,
					withPackInfo: true,
					cmdType: "1",
					packInfo: {
						packname: packname.toString(),
						author: author.toString(),
					},
				});
				await sock.sendMessage(from, { sticker: stickerBuff }, { quoted: msg });
			} else if (
				(isMedia && msg.message.videoMessage.fileLength < 2 << 20) ||
				(isQVid && quoted.message.videoMessage.fileLength < 2 << 20)
			) {
				buffer = isQVid ? await quoted.download() : await msg.download();
				stickerBuff = await sticker(buffer, {
					isVideo: true,
					withPackInfo: true,
					cmdType: "1",
					packInfo: {
						packname: packname.toString(),
						author: author.toString(),
					},
				});
				await sock.sendMessage(from, { sticker: stickerBuff }, { quoted: msg });
			} else if (isQStick) {
				const name_1 = getRandom(".webp");
				ex.create(packname.toString(), author.toString(), sender);
				await quoted.download(`./temp/${name_1}`);
				run(`webpmux -set exif ./temp/${sender}.exif ./temp/${name_1} -o ./temp/${name_1}`, async function (e) {
					if (e) return (await msg.reply("Error")) && fs.unlinkSync(`./temp/${name_1}`);
					await sock.sendMessage(from, { sticker: { url: `./temp/${name_1}` } }, { quoted: msg });
					fs.unlinkSync(`./temp/${name_1}`);
					fs.unlinkSync(`./temp/${sender}.exif`);
				});
			} else if (
				isQDoc &&
				(/image/.test(quoted.message.documentMessage.mimetype) ||
					(/video/.test(quoted.message.documentMessage.mimetype) &&
						quoted.message.documentMessage.fileLength < 2 << 20))
			) {
				let ext = /image/.test(quoted.message.documentMessage.mimetype)
					? { isImage: true }
					: /video/.test(quoted.message.documentMessage.mimetype)
					? { isVideo: true }
					: null;
				if (!ext) return await msg.reply("Document mimetype unknown");
				const buffer = await quoted.download();
				const stickerBuff = await sticker(buffer, {
					...ext,
					withPackInfo: true,
					cmdType: "1",
					packInfo: {
						packname: packname.toString(),
						author: author.toString(),
					},
				});
				await sock.sendMessage(from, { sticker: stickerBuff }, { quoted: msg });
			} else {
				await msg.reply(`IND:\n${lang.indo.stick}\n\nEN:\n${lang.eng.stick}`);
			}
			(buffer = null), (stickerBuff = null);
		} catch (e) {
			await msg.reply("Error while creating sticker");
		}
	},
};
