const { fetchJson } = require("../../../utils");
const Util = require("util");

let surahList = "https://raw.githubusercontent.com/penggguna/QuranJSON/master/quran.json",
	ayatSurah = "https://raw.githubusercontent.com/penggguna/QuranJSON/master/surah/%s.json",
	randomAyatStr = "https://quran-api-id.vercel.app/random";

function listSurah() {
	return fetchJson(surahList);
}

function getSurah(id) {
	return fetchJson(Util.format(ayatSurah, id));
}

async function randomAyat() {
	const rawJson = await fetchJson(randomAyatStr);
	let data = { arab: rawJson?.arab, tr: rawJson?.translation, audio: rawJson?.audio?.alafasy };
	return data;
}

module.exports = { listSurah, getSurah, randomAyat };