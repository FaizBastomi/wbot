const fs = require("fs");
const { getRandom } = require("../../utils");
const { webp2mp4 } = require("../../utils/uploader");
const lang = require("../other/text.json");
const run = require("child_process").exec;

module.exports = {
	name: "toimage",
	alias: ["toimg", "tomedia", "tovid", "tovideo"],
	category: "general",
	desc: "Convert your sticker to media (image)",
	async exec({ sock, msg }) {
		const { quoted, from, type } = msg;

		const content = JSON.stringify(quoted);
		const isQStick = type === "extendedTextMessage" && content.includes("stickerMessage");
		const QStickEph = type === "ephemeralMessage" && content.includes("stickerMessage");

		try {
			if (
				(isQStick && quoted.message.stickerMessage.isAnimated === false) ||
				(QStickEph && quoted.message.stickerMessage.isAnimated === false)
			) {
				const ran = getRandom(".webp");
				const ran1 = getRandom(".png");
				let path = await quoted.download(`./temp/${ran}`);
				run(`ffmpeg -i ${path} ./temp/${ran1}`, async function (err) {
					fs.unlinkSync(path);
					if (err)
						return await msg.reply(
							`IND:\n${lang.indo.util.toimg.fail}\n\nEN:\n${lang.eng.util.toimg.fail}`
						);
					await sock.sendMessage(
						from,
						{ image: fs.readFileSync(`./temp/${ran1}`), caption: "Done." },
						{ quoted: msg }
					);
					fs.unlinkSync(`./temp/${ran1}`);
				});
			} else if (
				(isQStick && quoted.message.stickerMessage.isAnimated === true) ||
				(QStickEph && quoted.message.stickerMessage.isAnimated === true)
			) {
				const ran = getRandom(".webp");
				let path = await quoted.download(`./temp/${ran}`);
				const ezgif = await webp2mp4(path);
				await sock.sendMessage(from, { video: { url: ezgif } }, { quoted: msg });
				fs.unlinkSync(path);
			} else {
				await msg.reply(`IND:\n${lang.indo.util.toimg.msg}\n\nEN:\n${lang.eng.util.toimg.msg}`);
			}
		} catch {
			await msg.reply(`IND:\n${lang.indo.util.toimg.fail}\n\nEN:\n${lang.eng.util.toimg.fail}`);
		}
	},
};
