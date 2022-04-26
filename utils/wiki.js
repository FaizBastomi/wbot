const wiki = require("wikijs").default;

/**
 * Search on Wikipedia.org
 * @param {String} query query to search on Wikipedia.org
 * @param {"id"|"en"} lang Wikipedia.org language
 */
module.exports = async (query, lang) => {
	if (!lang) throw Error("No language provided!");

	if (lang === "id") {
		let wikiS = await wiki({ apiUrl: "https://id.wikipedia.org/w/api.php" }).search(query);
		const wikiP = await wiki({ apiUrl: "https://id.wikipedia.org/w/api.php" }).page(wikiS.results[0]);
		let ctx = await wikiP.content();
		const sumry = await wikiP.summary();

		let text = `${wikiP.url()}\n\n${sumry === "" ? "-" : sumry}\n\n`;
		for (let idx in ctx) {
			text += `${ctx[idx].title}\n${ctx[idx].content === "" ? "-" : ctx[idx].content}\n\n`;
		}
		return text;
	} else if (lang === "en") {
		let wikiS = await wiki({ apiUrl: "https://en.wikipedia.org/w/api.php" }).search(query);
		const wikiP = await wiki({ apiUrl: "https://en.wikipedia.org/w/api.php" }).page(wikiS.results[0]);
		let ctx = await wikiP.content();
		const sumry = await wikiP.summary();

		let text = `${wikiP.url()}\n\n${sumry === "" ? "-" : sumry}\n\n`;
		for (let idx in ctx) {
			text += `${ctx[idx].title}\n${ctx[idx].content === "" ? "-" : ctx[idx].content}\n\n`;
		}
		return text;
	}
};
