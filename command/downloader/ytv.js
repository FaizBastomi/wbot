const Downloader = require("../../utils/downloader");
const { yt } = new Downloader();
const { fetchText, textParse, fetchBuffer } = require("../../utils");
const lang = require("../other/text.json");
const { validateURL } = require("../../utils/youtube-url-utils");

module.exports = {
	name: "ytv",
	limit: true,
	consume: 2,
	alias: ["ytmp4", "ytvid", "ytvideo"],
	category: "downloader",
	desc: "Download YouTube Video",
	async exec({ sock, msg, args }) {
		try {
			if (args.length < 1) return await msg.reply(`URL not provided`);
			let { url, opt } = textParse(args.join(" "));
			if (!validateURL(url)) return await msg.reply(lang.eng.util.download.notYTURL);
			await msg.reply(`IND:\n${lang.indo.util.download.progress}\n\nEN:\n${lang.eng.util.download.progress}`);

			const res = await yt(url, "video");
			if (res === "no_file") return await msg.reply("No download link found, maybe try another link?");
			switch (opt) {
				case "--doc":
					if (res.size >= 30 << 10) {
						let short = await fetchText(`https://tinyurl.com/api-create.php?url=${res.dl_link}`);
						let capt =
							`*Title:* ${res.title}\n` +
							`*Quality:* ${res.q}\n*Size:* ${res.sizeF}\n*Download:* ${short}\n\n_Filesize to big_`;
						await sock.sendMessage(msg.from, { image: { url: res.thumb }, caption: capt }, { quoted: msg });
					} else {
						await sock.sendMessage(
							msg.from,
							{
								document: await fetchBuffer(res.dl_link, { skipSSL: true }),
								mimetype: "video/mp4",
								fileName: res.title + ".mp4",
							},
							{ quoted: msg }
						);
					}
					break;
				default:
					if (res.size >= 30 << 10) {
						let short = await fetchText(`https://tinyurl.com/api-create.php?url=${res.dl_link}`);
						let capt =
							`*Title:* ${res.title}\n` +
							`*Quality:* ${res.q}\n*Size:* ${res.sizeF}\n*Download:* ${short}\n\n_Filesize to big_`;
						await sock.sendMessage(msg.from, { image: { url: res.thumb }, caption: capt }, { quoted: msg });
					} else {
						let capt = `Title: ${res.title}\nSize: ${res.sizeF}`;
						await sock.sendMessage(
							msg.from,
							{
								video: await fetchBuffer(res.dl_link, { skipSSL: true }),
								mimetype: "video/mp4",
								caption: capt,
							},
							{ quoted: msg }
						);
					}
			}
		} catch (e) {
			console.log(e);
			await msg.reply("Something went wrong, check back later.");
		}
	},
};
