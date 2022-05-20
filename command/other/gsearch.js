const gsearch = require("googlethis");
const { uploaderAPI } = require("../../utils/uploader");
const { footer } = require("../../config.json");

module.exports = {
	name: "gsearch",
	category: "random",
	desc: "Search on Google",
	use:
		"[-options] <query>\n\nOptions:\n- image (Image search)\n- reverse (Reverse Image Search)" +
		"\n\n#gsearch -image Kitagawa Marin\nor\n#gsearch My Dress Up Darling",
	async exec({ sock, msg, args }) {
		if (!args.length > 0) return await msg.reply("'query' need for this command");
		let gResult,
			data = null,
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
						text += `*${res.title}*\n${res.description}\n${res.url}\n\n`;
					}
					await sock.sendMessage(from, { image: { url: img }, caption: text }, { quoted: msg });
					break;
				case "-image":
					(gResult = await gsearch.image(query, { safe: false })),
						(data = gResult?.[Math.floor(Math.random() * gResult.length)]),
						(img = data?.url ? data.url : "https://telegra.ph/file/177a7901780b35d7123c7.png");
					await sock.sendMessage(
						from,
						{
							image: { url: img },
							caption: `*Google Image Search*\n\n*${data?.origin?.title}*\nwidth: ${data?.width}\nheight: ${data?.height}`,
							templateButtons: [
								{ urlButton: { displayText: "source", url: data?.url } },
								{ quickReplyButton: { displayText: "➡️ Next", id: `#gsearch -image ${query}` } },
							],
							footer,
						},
						{ quoted: msg }
					);
					break;
				case "-reverse":
					if ((isMedia && !msg.message.videoMessage) || isQImg) {
						let media = isQImg ? await quoted.download() : await msg.download(),
							urlMedia = await uploaderAPI(media, "telegraph");
						(gResult = await gsearch.search(urlMedia.data.url, { safe: false, ris: true })),
							(text = `*Google Reverse Image Search*\n\n`);
						for (let res of gResult.results) {
							text += `*${res.title}*\n${res.description}\n${res.url}\n\n`;
						}
						await sock.sendMessage(from, { text }, { quoted: msg });
					} else {
						await msg.reply(
							"this option only accept image\nSend/reply image with caption ```#gsearch -reverse```"
						);
					}
					break;
				default:
					(gResult = await gsearch.search(query, { safe: false })),
						(text = `*Google Search*\nQuery ~> ${query}\n\n`),
						(img = gResult?.results?.[0]?.favicons?.high_res
							? gResult?.results?.[0]?.favicons?.high_res
							: "https://telegra.ph/file/177a7901780b35d7123c7.png");
					for (let res of gResult.results) {
						text += `*${res.title}*\n${res.description}\n${res.url}\n\n`;
					}
					await sock.sendMessage(from, { image: { url: img }, caption: text }, { quoted: msg });
			}
		} catch (e) {
			console.log(e);
			await msg.reply(`Err:\n${e.message}`);
		}
	},
};
