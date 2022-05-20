const gsearch = require("googlethis");
const { footer } = require("../../config.json");

module.exports = {
	name: "pin",
	desc: "Search image on Pinterest",
	use: "<query>",
	alias: ["pinterest"],
	category: "random",
	limit: true,
	consume: 2,
	async exec({ sock, msg, args }) {
		if (!args.length > 0) return await msg.reply("'query' need for this command");
		try {
			let gResult = await gsearch.image(args.join(" "), {
				safe: false,
				additional_params: { as_sitesearch: "pinterest.com" },
			});
			if (!gResult.length > 0) {
				return await msg.reply("No photo found for this query");
			} else {
				let data = gResult[Math.floor(Math.random() * gResult.length)];
				let buttons = [
					{ urlButton: { displayText: "source", url: data?.url } },
					{ quickReplyButton: { displayText: "➡️ Next", id: `#pin ${args.join(" ")}` } },
				];
				await sock.sendMessage(
					msg.from,
					{
						image: { url: data?.url },
						caption: `*${data?.origin?.title}*\nwidth: ${data?.width}\nheight: ${data?.height}`,
						templateButtons: buttons,
						footer,
					},
					{ quoted: msg }
				);
			}
		} catch (e) {
			await msg.reply(`Err;\n${e.message}`);
		}
	},
};
