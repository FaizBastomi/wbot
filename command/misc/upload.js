const { uploaderAPI } = require("../../utils/uploader");

module.exports = {
	name: "upload",
	limit: true,
	consume: 4,
	premium: true,
	premiumType: ["drakath", "nulgath", "artix"],
	alias: ["upld"],
	use: "*<hosting>*\nSend/Reply to a message media with caption\n\n" + "*Hosting*\n- telegraph\n- uguu\n- anonfiles",
	category: "misc",
	async exec({ sock, msg, args }) {
		const { from, quoted, type } = msg;
		try {
			let host = args[0];
			const content = JSON.stringify(quoted);
			const isMed = type === "imageMessage" || type === "videoMessage";
			const isQMed =
				type === "extendedTextMessage" &&
				(content.includes("imageMessage") || content.includes("videoMessage"));
			if (host === "" || !host) host = "telegraph";

			let resUrl,
				mtype = quoted ? Object.keys(quoted.message)[0] : Object.keys(msg.message)[0],
				filesize =
					Math.floor(
						(quoted ? quoted?.message?.[mtype]?.fileLength : msg?.message?.[mtype]?.fileLength) / 1000
					) || 0;

			if (filesize > 40 << 10) return await msg.reply("Max filesize is 40MB");
			if (quoted && isQMed) {
				resUrl = await uploaderAPI(await quoted.download(), host);
				await sock.sendMessage(
					from,
					{
						text: `*Host:* ${resUrl.host}\n*URL:* ${resUrl.data.url}\n*Name:* ${resUrl.data.name}\n*Size:* ${resUrl.data.size}`,
					},
					{ quoted: msg }
				);
			} else if (isMed) {
				resUrl = await uploaderAPI(await msg.download(), host);
				await sock.sendMessage(
					from,
					{
						text: `*Host:* ${resUrl.host}\n*URL:* ${resUrl.data.url}\n*Name:* ${resUrl.data.name}\n*Size:* ${resUrl.data.size}`,
					},
					{ quoted: msg }
				);
			} else {
				await msg.reply("No media message found.\nDocument and sticker message currently not supported.");
			}
		} catch (e) {
			await msg.reply(`Error: ${e.message}`);
		}
	},
};
