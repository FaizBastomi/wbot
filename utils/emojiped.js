const { default: axios } = require("axios");
const cheerio = require("cheerio");

/**
 * Emojipedia.org
 * @param emoji Emoji you want to search
 * @returns {Promise<string[]>}
 */
module.exports = async (emoji) => {
	const html = await axios.get(`https://emojipedia.org/${encodeURIComponent(emoji)}`);
	const $ = cheerio.load(html.data);

	let links = {};
	$("section.vendor-list")
		.find("div.vendor-container.vendor-rollout-target")
		.each(function (a, b) {
			links[$(b).find("h2").text().toLowerCase().replace(/ /g, "_")] = $(b)
				.find("img")
				.attr("srcset")
				.split(" ")[0];
		});
	return links;
};
