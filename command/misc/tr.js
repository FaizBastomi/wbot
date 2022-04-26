const trAPI = require("@vitalets/google-translate-api");

module.exports = {
	name: "tr",
	alias: ["translate"],
	category: "misc",
	use: "<text> atau reply sebuah pesan teks",
	async exec({ msg, args }) {
		const { quoted } = msg;
		try {
			let text;
			if (quoted) {
				text = await translate(quoted.text, args[0]);
				await msg.reply(text);
			} else if (args.length >= 2) {
				text = await translate(args.slice(1).join(" "), args[0]);
				await msg.reply(text);
			} else {
				msg.reply(
					"Reply sebuah pesan atau ikuti format berikut.\n!tr <bahasa> <teks>\njangan gunakan <> saat menggunakan perintah.\nGunakan format ISO 3166-1 alpha-2 untuk kode bahasa negara :)."
				);
			}
		} catch (e) {
			await msg.reply(e);
		}
	},
};

async function translate(text, lang) {
	let text2;
	try {
		text2 = (await trAPI(text, { client: "gtx", to: lang })).text;
	} catch (e) {
		throw "Failed to translate";
	} finally {
		return text2;
	}
}
