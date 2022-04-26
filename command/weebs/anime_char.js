const axios = require("axios").default;

module.exports = {
	name: "char",
	limit: true,
	consume: 1,
	alias: ["characters"],
	category: "weebs",
	desc: "Search anime characters\ndata from myanimelist.net",
	async exec({ sock, msg, args, arg }) {
		const { from } = msg;
		try {
			if (!args.length > 0) return msg.reply("No characters name to search");
			let num = parseInt(arg.split("#")[1]) - 1 || 0;
			let title = args.join(" ").includes("#") ? arg.split("#")[0] : args.join(" ");
			if (isNaN(num)) num = 0;
			const searchRes = await search(title, num);
			await sock.sendMessage(from, { image: { url: searchRes.image }, caption: searchRes.data }, { quoted: msg });
		} catch (e) {
			await msg.reply(`Something bad happen\n${e.message}`);
		}
	},
};

/**
 * Search anime characters via api.jikan.moe
 * @param {String} query Characters name to search
 * @param {number} number Get result for 1,2,3 based on given number
 * @returns
 */
const search = (query, number) => {
	return new Promise(async (resolve, reject) => {
		let metadata;
		try {
			const { data: char } = (
				await axios.get(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}`)
			).data;
			const { data: anime } = (
				await axios.get(`https://api.jikan.moe/v4/characters/${char[number].mal_id}/anime`)
			).data;
			const { data: voice } = (
				await axios.get(`https://api.jikan.moe/v4/characters/${char[number].mal_id}/voices`)
			).data;
			let data3 =
				`*Result:* ${number + 1} of ${char.length}\n\n*📕Name:* ${char[number].name}\n*⚜️About:* ${
					char[number].about
				}\n*🔍MAL_ID:* ${char[number].mal_id}\n` +
				`\n*🔖Appears:*${anime
					.map((val) => `\n*🔮Role:* ${val.role}\n*🎬Title:* ${val.anime.title}`)
					.join("\n")}\n` +
				`\n*👥VA:*${voice
					.map((val) => `\n*🌐Language:* ${val.language}\n*👤Person:* ${val.person.name}`)
					.join("\n")}`;
			metadata = {
				image: char[number].images.jpg.image_url,
				data: data3,
			};
		} catch (e) {
			reject(e);
		} finally {
			resolve(metadata);
		}
	});
};
