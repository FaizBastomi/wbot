const axios = require("axios").default;

module.exports = {
	name: "search",
	limit: true,
	consume: 1,
	alias: ["anime"],
	category: "weebs",
	desc: "Search for anime\ndata from myanimelist.net",
	async exec({ sock, msg, args, arg }) {
		const { from } = msg;
		try {
			if (!args.length > 0) return msg.reply("No Anime title for search");
			let num = parseInt(arg.split("#")[1]) - 1 || 0;
			let title = args.join(" ").includes("#") ? arg.split("#")[0] : args.join(" ");
			if (isNaN(num)) num = 0;
			const searchRes = await search(title, num);
			await sock.sendMessage(from, { image: { url: searchRes.image }, caption: searchRes.data }, { quoted: msg });
		} catch (e) {
			await sock.sendMessage(from, { text: `Something bad happen\n${e.message}` }, { quoted: msg });
		}
	},
};

/**
 * Search anime via api.jikan.moe
 * @param {String} query Anime to search
 * @param {number} number Get result for 1,2,3 based on given number
 * @returns
 */
const search = (query, number = 0) => {
	return new Promise(async (resolve, reject) => {
		let data2;
		try {
			const { data } = (await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`)).data;
			let data3 =
				`*Result:* ${number + 1} of ${data.length}\n\n*📕Title:* ${data[number].title}/${
					data[number].title_english
				}/${data[number].title_japanese}\n*🔖Trailer:* ${data[number].trailer.url}\n` +
				`*🔍MAL_ID:* ${data[number].mal_id}\n*✴️Type:* ${data[number].type}\n*🎬Episode(s):* ${data[number].episodes}\n*📢Airing:* ${data[number].status}\n*🔔Date:* ${data[number].aired.string}\n` +
				`*🔱Rating:* ${data[number].rating}\n*⚜️Duration:* ${data[number].duration}\n*♨️Score:* ${
					data[number].score
				}\n*📦Studio(s):* ${data[number].studios.map((val) => `${val.name}`).join(", ")}\n` +
				`*🎞️Genre(s):* ${data[number].genres.map((val) => `${val.name}`).join(", ")}\n*📚Synopsis:* ${
					data[number].synopsis
				}`;
			data2 = {
				image: data[number].images.jpg.image_url,
				data: data3,
			};
		} catch (e) {
			reject(e);
		} finally {
			resolve(data2);
		}
	});
};
