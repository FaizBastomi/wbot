const gsearch = require("googlethis");
const { uploaderAPI } = require("../../utils/uploader");

module.exports = {
	name: "gsearch",
	category: "misc",
	desc: "Search on Google",
	use:
		"[-options] <query>\n\nOptions:\n- image (Image search)\n- reverse (Reverse Image Search)" +
		"\n\n#gsearch -image Kitagawa Marin\nor\n#gsearch My Dress Up Darling",
	async exec({ sock, msg, args }) {
		if (!args.length > 0) return await msg.reply("'query' need for this command");
		let gResult,
			text = "",
			img = null,
			query = args.join(" ").replace(/\-(?:search|reverse|image)/g, ""),
			opts = args.join(" ").match(/\-(?:search|reverse|image)/g)?.[0];

		// image detector
		const { quoted, from, type } = msg,
			content = JSON.stringify(quoted),
			isMedia = type === "imageMessage",
			isQImg = type === "extendedTextMessage" && content.includes("imageMessage");
		try {
			switch (opts) {
				case "-search":
					(gResult = await gsearch.search(query, { safe: false })),
						(text = `*Google Search*\nQuery ~> ${query}\n\n`),
						(img = gResult?.results?.[0]?.favicons?.high_res
							? gResult?.results?.[0]?.favicons?.high_res
							: "https://telegra.ph/file/177a7901780b35d7123c7.png");
					for (let res of gResult.results) {
						text += `*Title:* ${res.title}\n*Desc:* ${res.description}\n*URL:* ${res.url}\n\n`;
					}
					await sock.sendMessage(from, { image: { url: img }, caption: text }, { quoted: msg });
					break;
				case "-image":
					(gResult = await gsearch.image(query, { safe: false })),
						(img = gResult?.[0]?.url
							? gResult?.[0]?.url
							: "https://telegra.ph/file/177a7901780b35d7123c7.png"),
						(text = `*Google Image Search*\nQuery ~> ${query}\n\n`);
					for (let res of gResult) {
						text += `*Title:* ${res.origin.title}\n*URL:* ${res.origin.source}\n*Img:* ${res.url}\n\n`;
					}
					await sock.sendMessage(from, { image: { url: img }, caption: text }, { quoted: msg });
					break;
				case "-reverse":
					if ((isMedia && !msg.message.videoMessage) || isQImg) {
						let media = isQImg ? await quoted.download() : await msg.download(),
							urlMedia = await uploaderAPI(media, "telegraph");
						(gResult = await gsearch.search(urlMedia.data.url, { safe: false, ris: true })),
							(text = `*Google Reverse Image Search*\n\n`);
						for (let res of gResult.results) {
							text += `*Title:* ${res.title}\n*URL:* ${res.url}\n*Desc:* ${res.description}\n\n`;
						}
						await sock.sendMessage(from, { text }, { quoted: msg });
					} else {
						await msg.reply("this option only accept image\nSend/reply image with caption ```#gsearch -reverse```");
					}
					break;
				default:
					(gResult = await gsearch.search(query, { safe: false })),
						(text = `*Google Search*\nQuery ~> ${query}\n\n`),
						(img = gResult?.results?.[0]?.favicons?.high_res
							? gResult?.results?.[0]?.favicons?.high_res
							: "https://telegra.ph/file/177a7901780b35d7123c7.png");
					for (let res of gResult.results) {
						text += `*Title:* ${res.title}\n*Desc:* ${res.description}\n*URL:* ${res.url}\n\n`;
					}
					await sock.sendMessage(from, { image: { url: img }, caption: text }, { quoted: msg });
			}
		} catch (e) {
			console.log(e);
			await msg.reply(`Err:\n${e.message}`);
		}
	},
};
