const { telegramSticker } = require("../../utils/scraper");
const { footer } = require("../../config.json");

module.exports = {
	name: "telestick",
	limit: true,
	consume: 2,
	category: "general",
	desc: "Search telegram sticker for you.",
	use: "<query>|[page number].\nExample: #telestick Ame|2",
	async exec({ msg, arg, sock }) {
		try {
			let dataSticker,
				text = "",
				page = parseInt(arg.split("|")[1]) || 1,
				query = arg.split("|")[0] || null;
			if (query === "" || !query || query === ".telestick") return await msg.reply("No query given to search");

			dataSticker = await telegramSticker.search(query, page);
			if (!dataSticker.stickers.length > 0) return await msg.reply("No sticker were found");

			text +=
				`Search result: \`\`\`${query}\`\`\`\nTotal Page: ${dataSticker.pageInfo.total}\n` +
				`Now at: ${page}\n\n`;
			for (let idx in dataSticker.stickers) {
				text += `Name: ${dataSticker.stickers[idx].name}\nLink: ${dataSticker.stickers[idx].link}\n\n`;
			}
			text += "Download function coming soon.";

			// delete old message
			if (msg.quoted) await msg.quoted.delete();
			if (dataSticker.pageInfo.total === 1) {
				await msg.reply(text);
			} else if (page < dataSticker.pageInfo.total && page === 1) {
				const buttons = [
					{
						buttonId: `#telestick ${query}|${page + 1} SMH`,
						buttonText: { displayText: "➡️ Next" },
						type: 1,
					},
				];
				await sock.sendMessage(
					msg.from,
					{
						text,
						footer: footer,
						buttons,
						headerType: 1,
					},
					{ quoted: msg }
				);
			} else if (page < dataSticker.pageInfo.total) {
				const buttons = [
					{
						buttonId: `#telestick ${query}|${page - 1} SMH`,
						buttonText: { displayText: "⬅️ Previous" },
						type: 1,
					},
					{
						buttonId: `#telestick ${query}|${page + 1} SMH`,
						buttonText: { displayText: "➡️ Next" },
						type: 1,
					},
				];
				await sock.sendMessage(
					msg.from,
					{
						text,
						footer: footer,
						buttons,
						headerType: 1,
					},
					{ quoted: msg }
				);
			} else if (page === dataSticker.pageInfo.total) {
				const buttons = [
					{
						buttonId: `#telestick ${query}|${page - 1} SMH`,
						buttonText: { displayText: "⬅️ Previous" },
						type: 1,
					},
				];
				await sock.sendMessage(
					msg.from,
					{
						text,
						footer: footer,
						buttons,
						headerType: 1,
					},
					{ quoted: msg }
				);
			}
		} catch (e) {
			await msg.reply(`Err: \n${e.stack}`);
		}
	},
};
