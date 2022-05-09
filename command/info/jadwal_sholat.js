const axios = require("axios").default;
const { footer } = require("../../config.json");
let info =
	"Data yang tersedia, dari Januari 2021 sampai Desember 2030\n" +
	"Hanya tersedia untuk kota-kota besar di Indonesia. Kota lainnya, silakan disesuaikan sendiri sesuai plus minus waktu setempat.";

module.exports = {
	name: "sholat",
	limit: true,
	consume: 1,
	alias: ["jadwalsholat", "jadwal"],
	use: "<nama kota>",
	category: "information",
	async exec({ sock, msg, args }) {
		if (!args.length > 0) return await msg.reply(`Masukan nama kota.\n\nNote: ${info}`);

		try {
			let cityData,
				citySchedule,
				sections = [];
			// is number or not
			if (isNaN(parseInt(args[0]))) {
				cityData = await cariKota(args.join(" "));
				// array or string
				if (!Array.isArray(cityData)) return await msg.reply(cityData);

				if (cityData.length === 1) {
					// get prayer times by city id
					citySchedule = await getJadwal(cityData[0]?.id, "bulanan");
					await msg.reply(citySchedule);
				} else {
					for (let idx in cityData) {
						let sectionData = {
							title: "Pilih",
							rows: [
								{
									title: `Harian (${cityData[idx]?.lokasi})`,
									rowId: `#sholat ${cityData[idx]?.id} harian`,
									description: "Ambil jadwal sholat harian",
								},
								{
									title: `Bulanan (${cityData[idx]?.lokasi})`,
									rowId: `#sholat ${cityData[idx]?.id} bulanan`,
									description: "Ambil jadwal sholat bulanan",
								},
							],
						};
						sections.push(sectionData);
					}
					await sock.sendMessage(
						msg.from,
						{
							text: "Hasil pencarian kota",
							buttonText: "hasil",
							footer: footer,
							sections,
						},
						{ quoted: msg }
					);
				}
			} else {
				// get prayer times by city id
				citySchedule = await getJadwal(args[0], args[1]);
				await msg.reply(citySchedule);
			}
		} catch (e) {
			console.log(e);
			await msg.reply("Galat telah terjadi.");
		}
	},
};

const cariKota = async (namaKota) => {
	let { data: resCariKota } = await axios.get(`https://api.myquran.com/v1/sholat/kota/cari/${namaKota}`);
	if (!resCariKota.status) return resCariKota.message;
	return resCariKota.data;
};

const getJadwal = async (kotaId, tipe = "harian") => {
	try {
		let date = new Date(),
			config = { responseType: "json" },
			resJadwalKota,
			teks = "";
		switch (tipe) {
			case "harian":
				resJadwalKota = await axios.get(
					`https://api.myquran.com/v1/sholat/jadwal/${kotaId}/${date.getFullYear()}/${
						date.getMonth() + 1
					}/${date.getDate()}`,
					config
				);
				teks += `Lokasi: ${resJadwalKota?.data?.data?.lokasi}\nDaerah: ${resJadwalKota?.data?.data?.daerah}\n\n`;
				teks += Object.keys(resJadwalKota?.data?.data?.jadwal)
					.map((vue) => `*${vue}*: ${resJadwalKota?.data?.data?.jadwal[vue]}`)
					.join("\n");
				break;
			case "bulanan":
				resJadwalKota = await axios.get(
					`https://api.myquran.com/v1/sholat/jadwal/${kotaId}/${date.getFullYear()}/${date.getMonth() + 1}`,
					config
				);
				teks += `Lokasi: ${resJadwalKota?.data?.data?.lokasi}\nDaerah: ${resJadwalKota?.data?.data?.daerah}\n\n`;
				for (let idx in resJadwalKota?.data?.data?.jadwal) {
					teks +=
						Object.keys(resJadwalKota?.data?.data?.jadwal[idx])
							.map((vue) => `*${vue}*: ${resJadwalKota?.data?.data?.jadwal[idx][vue]}`)
							.join("\n") + "\n\n";
				}
				break;
		}
		return teks;
	} catch (e) {
		throw e;
	}
};
