const axios = require("axios").default;
const Bluebird = require("bluebird");
const cheerio = require("cheerio");
const { UserAgent } = require("./index");

/**
 * Request to some website
 * @param {string} url url
 * @param {import("axios").AxiosRequestConfig} config axios config
 */
async function request(url, config) {
	return axios(url, config);
}

const telegramSticker = {
	/**
	 * Search
	 * @param {string} query query to search
	 * @param {number} page page number
	 */
	search: async (query, page = 1) => {
		let stickers = [],
			pagePagination = [];
		let { data: htmlResponse } = await request(`https://combot.org/telegram/stickers?page=${page}&q=${query}`, {
			method: "GET",
		});
		const $rootCombot = cheerio.load(htmlResponse);
		$rootCombot(".sticker-packs-list > div").each(function () {
			stickers.push({
				name: $rootCombot(this).find(".sticker-pack__title").text()?.trim(),
				link: $rootCombot(this).find(".sticker-pack__header > a.sticker-pack__btn").attr("href"),
			});
		});
		$rootCombot(".pagination__pages")
			.find("a.pagination__link ")
			.each(function (_, data) {
				let link = $rootCombot(data).attr("href");
				if (pagePagination.includes("https://combot.org" + link)) return;
				pagePagination.push("https://combot.org" + link);
			});
		return {
			stickers,
			pageInfo: {
				pagePagination,
				total: pagePagination.length,
			},
		};
	},
};

/**
 * Emojipedia
 * @param {string} emoji emoji to search
 */
const emojiped = async (emoji) => {
	const html = await request(`https://emojipedia.org/${encodeURIComponent(emoji)}`, { method: "GET" });
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

const sfile = {
	search: async (query) => {
		let sessCookie,
			agent = UserAgent(),
			links = [];
		let homePage = await request("https://sfile.mobi", {
			method: "GET",
			headers: {
				"User-Agent": agent,
			},
		});
		sessCookie = homePage.headers["set-cookie"][0];
		let { data: htmlResponse } = await request(`https://sfile.mobi/search.php?q=${query}`, {
			method: "GET",
			headers: {
				"User-Agent": agent,
				cookie: sessCookie,
			},
		});
		const $rootSfile = cheerio.load(htmlResponse);
		$rootSfile("body > div.w3-row-padding.w3-container > div > div.w3-card.white")
			.find("div.list")
			.each(function (_, data) {
				let text = $rootSfile(data).find("a").text()?.trim()?.replace(/ +/g, "-");
				let link = $rootSfile(data).find("a").attr("href");
				let size = $rootSfile(data)
					.remove("a, img")
					.text()
					?.match(/\([^)]*\)/g)?.[0]
					?.replace(/[()]/g, "");
				if (!link) return;
				links.push({ name: text, size, link });
			});
		(homePage = null), (htmlResponse = null);
		return links;
	},
	latest: async () => {
		let sessCookie,
			agent = UserAgent(),
			links = [];
		let homePage = await request("https://sfile.mobi", {
			method: "GET",
			headers: {
				"User-Agent": agent,
			},
		});
		sessCookie = homePage.headers["set-cookie"][0];
		let { data: htmlResponse } = await request(`https://sfile.mobi/uploads.php`, {
			method: "GET",
			headers: {
				"User-Agent": agent,
				cookie: sessCookie,
			},
		});
		const $rootSfile = cheerio.load(htmlResponse);
		$rootSfile("body > div.w3-row-padding.w3-container > div > div.w3-card.white")
			.find("div.list")
			.each(function (_, data) {
				let text = $rootSfile(data).find("a").text()?.trim()?.replace(/ +/g, "_");
				let link = $rootSfile(data).find("a").attr("href");
				let size = $rootSfile(data).find("small").text()?.split(", ")[0];
				let upload = $rootSfile(data).find("small").text()?.split(", ")[1];
				if (!link) return;
				links.push({ name: text, size, upload, link });
			});
		return links;
	},
	download: (url) => {},
};

module.exports = {
	emojiped,
	telegramSticker,
	sfile,
};
