const { sfile } = require("../../utils/scraper");

module.exports = {
	name: "sfile",
	limit: true,
	consume: 3,
	alias: ["sf"],
	desc: "Search and download file form sfile.mobi",
	use: "<option> <query|link>\n\nOptions:\n- search\n- latest",
	category: "downloader",
	async exec({ msg, args }) {
		try {
			if (!args.length > 0) return await msg.reply("No option entered.\nPlease refer to #help sfile");
			let opts = args[0],
				query = args.slice(1),
				searchResult,
				text = "";
			switch (opts) {
				case "search":
					searchResult = await sfile.search(query.join(" "));
					if (!searchResult.length > 0) return await msg.reply("No result");
					text += `Result for: \`\`\`${query.join(" ")}\`\`\`\n\n`;
					for (let idx in searchResult) {
						text += `*Name*: ${searchResult[idx].name}\n*Size*: ${searchResult[idx].size}\n*Link*: ${searchResult[idx].link}\n\n`;
					}
					await msg.reply(text);
					break;
				case "latest":
					searchResult = await sfile.latest();
					text += "Latest upload from sfile.mobi\n\n";
					for (let idx in searchResult) {
						text +=
							`*Name*: ${searchResult[idx].name}\n*Size*: ${searchResult[idx].size}\n` +
							`*${searchResult[idx].upload}*\n*Link*: ${searchResult[idx].link}\n\n`;
					}
					await msg.reply(text);
					break;
				// case "download":
				// case "dl":
				//     let { dlink, sessCookie, filename, mime } = await sfile.download(query[0]);
				//     if (!dlink) return await msg.reply("No download link found");
				//     let dBuffer = await fetchBuffer(dlink, { headers: { cookie: sessCookie }});
				//     await sock.sendMessage(msg.from, { document: dBuffer, fileName: filename, mimetype: mime }, { quoted: msg });
				//     break;
				default:
					await msg.reply("Available option *search* | *latest*.\nExample: #sfile search MT Manager");
			}
		} catch {
			await msg.reply("Error while processing your request");
		}
	},
};
