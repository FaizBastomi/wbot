const { generateWAMessageFromContent, proto } = require("@adiwajshing/baileys");
const Downloader = require("../../utils/downloader");
const { yt, yts } = new Downloader();
const { fetchBuffer, fetchText } = require("../../utils");
const { footer } = require("../../config.json");

module.exports = {
	name: "play",
	category: "downloader",
	desc: "Play media from YouTube.",
	async exec({ sock, msg, args }) {
		const { from, sender } = msg;
		if (args.length < 1) return await msg.reply("No query given to search.");
		const ytsData = await yts(args.join(" "), "short");
		if (!ytsData.length > 0) return await msg.reply("No video found for that keyword, try another keyword");
		let thumb = await fetchBuffer(ytsData[0].thumbnail);
		const res = await yt(ytsData[0].url, "audio");
		if (res === "no_file") return await msg.reply("No download link found, maybe try another keyword?");

		// message struct
		let prep = generateWAMessageFromContent(
			from,
			proto.Message.fromObject({
				buttonsMessage: {
					locationMessage: { jpegThumbnail: thumb.toString("base64") },
					contentText: `📙 Title: ${ytsData[0].title}\n📎 Url: ${ytsData[0].url}\n🚀 Upload: ${ytsData[0].ago}\n\nWant a video version? click button below, or you don\'t see it? type *!ytv youtube_url*\n\nAudio on progress....`,
					footerText: footer,
					headerType: 6,
					buttons: [
						{ buttonText: { displayText: "Video" }, buttonId: `#ytv ${ytsData[0].url} SMH`, type: 1 },
					],
				},
			}),
			{ timestamp: new Date() }
		);

		// Sending message
		await sock.relayMessage(from, prep.message, { messageId: prep.key.id }).then(async () => {
			try {
				if (res.size >= 10 << 10) {
					let short = await fetchText(`https://tinyurl.com/api-create.php?url=${res.dl_link}`);
					let capt =
						`*Title:* ${res.title}\n` +
						`*Quality:* ${res.q}\n*Size:* ${res.sizeF}\n*Download:* ${short}\n\n_Filesize to big_`;
					await sock.sendMessage(from, { image: { url: res.thumb }, caption: capt }, { quoted: prep });
				} else {
					let respMsg = await sock.sendMessage(
						from,
						{ audio: await fetchBuffer(res.dl_link, { skipSSL: true }), mimetype: "audio/mpeg" },
						{ quoted: prep }
					);
					let sections = [{ title: "Select result", rows: [] }];
					for (let idx in ytsData) {
						sections[0].rows.push({ title: ytsData[idx].title, rowId: `#yta ${ytsData[idx].url}` });
					}
					await sock.sendMessage(
						from,
						{
							text: "Wrong music?\nclick button below to choose another search result.",
							buttonText: "Search Result",
							footer: footer,
							mentions: [sender],
							sections,
						},
						{ quoted: respMsg }
					);
					sections = null;
				}
			} catch (e) {
				console.log(e);
				await msg.reply("Something wrong when sending the file");
			}
		});
		thumb = null;
	},
};
