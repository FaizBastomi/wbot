const quranScrape = require("./lib/quran-scrape");
const { footer } = require("../../config.json");

module.exports = {
	name: "quran",
	cooldown: 8,
	category: "information",
	use: "<-option> [query]\n\nOptions:\n- list\n- random\n- surah",
	desc: "Quran",
	async exec({ msg, args, sock }) {
		try {
			let opt = args.join(" ").match(/(?:list|surah|random)/g)?.[0],
				surahId = args.join(" ").match(/[0-9]{1,3}/g)?.[0],
				surah = null,
				listSurah = await quranScrape.listSurah(),
				sections = [];

			if (!surahId && !opt) return await msg.reply("check #help quran");
			if (surahId > 114 || surahId < 1) {
				while (listSurah.length) {
					let arr = listSurah.splice(0, 99),
						data = { title: "Pilih", rows: [] };
					for (let data_2 of arr) {
						data.rows.push({ title: data_2?.name, rowId: `#quran surah ${data_2?.number_of_surah}` });
					}
					sections.push(data);
				}
				return await sock.sendMessage(msg.from, {
					title: "List of Surah",
					text: "Surah tidak ada",
					buttonText: "Pilih",
					footer,
					sections,
				});
			}

			switch (opt) {
				case "list":
					while (listSurah.length) {
						let arr = listSurah.splice(0, 99),
							data = { title: "Pilih", rows: [] };
						for (let data_2 of arr) {
							data.rows.push({ title: data_2?.name, rowId: `#quran surah ${data_2?.number_of_surah}` });
						}
						sections.push(data);
					}
					await sock.sendMessage(msg.from, {
						text: "List of Surah",
						buttonText: "Pilih",
						footer,
						sections,
					});
					break;
				case "random":
					surah = await quranScrape.randomAyat();
					let msg_1 = await msg.reply(surah?.arab + "\n\n" + surah?.tr);
					await sock.sendMessage(
						msg.from,
						{
							audio: { url: surah?.audio },
							mimetype: "audio/mpeg",
							ptt: true,
						},
						{ quoted: msg_1 }
					);
					break;
				case "surah":
					surah = await quranScrape.getSurah(surahId);
					while (surah?.verses?.length) {
						let text = "",
							arr = surah?.verses?.splice(0, 100);

						for (let data of arr) {
							text += `${data?.text}\n${data?.translation_id}\n\n`;
						}
						await msg.reply(text);
					}
					break;
				default:
					surah = await quranScrape.getSurah(surahId);
					while (surah?.verses?.length) {
						let text = "",
							arr = surah?.verses?.splice(0, 100);

						for (let data of arr) {
							text += `${data?.text}\n${data?.translation_id}\n\n`;
						}
						await msg.reply(text);
					}
			}
		} catch (e) {
			console.log(e);
			await msg.reply(`Err:\n${e.stack}`);
		}
	},
};
