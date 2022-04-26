const axios = require("axios").default;
const cheerio = require("cheerio");
const { UserAgent } = require("./index");
const Util = require("util");
const API_GUEST = "https://api.twitter.com/1.1/guest/activate.json";
const API_TIMELINE = "https://api.twitter.com/2/timeline/conversation/%s.json?tweet_mode=extended";
const AUTH =
	"Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

const igdl = require("./instagram");

/**
 * Request to website
 * @param {string} url url
 * @param {import("axios").AxiosRequestConfig} config axios config
 */
async function request(url, config) {
	return axios(url, config);
}

/**
 * Get Twitter ID
 * @param {String} url Twitter URL
 * @returns {String} Twitter ID
 */
const getID = (url) => {
	let regex = /twitter\.com\/[^/]+\/status\/(\d+)/;
	let matches = regex.exec(url);
	return matches && matches[1];
};

/**
 * Musicaldown token and session
 */
async function getTokenAndSess() {
	let url = "https://musicaldown.com/en/";
	let ua = UserAgent();
	const res = await request(url, {
		headers: {
			"accept-language": "id,en-US;q=0.9,en;q=0.8",
			"sec-fetch-user": "?1",
			accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			"User-Agent": ua,
		},
	});
	const $ = cheerio.load(res.data);
	let metadata = {};
	$('form[class="col s12"]')
		.find("input")
		.each((a, b) => {
			metadata[$(b).attr("name")] = $(b).val() || "";
		});
	return { metadata, cookie: res.headers["set-cookie"][0], ua };
}

/**
 * Post to musicaldown
 * @param postData data
 * @param {string} sess Cookie Session
 * @param {string} ua User Agent
 */
async function muiscallyPost(postData, sess, ua) {
	let metadata = { mp4: [], mp3: [] };
	let resMp4 = await request("https://musicaldown.com/download", {
		method: "POST",
		data: new URLSearchParams(Object.entries(postData)),
		headers: {
			accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			"accept-language": "id,en-US;q=0.9,en;q=0.8",
			"content-type": "application/x-www-form-urlencoded",
			cookie: sess,
			"user-agent": ua,
		},
	});
	const cheerMp4 = cheerio.load(resMp4.data);
	cheerMp4("div.row")
		.find("a")
		.each((a, b) => {
			let rex = /(?:https:?\/{2})?(?:w{3}|v[0-9])?\.?(?:mscdn\.|tiktokcdn\.)?(?:com|xyz)([^\s&]+)/gi;
			let c = cheerMp4(b).attr("href");
			if (rex.test(c)) {
				metadata["mp4"].push(c);
			}
		});
	let resMp3 = await request("https://musicaldown.com/id/mp3", {
		method: "POST",
		data: new URLSearchParams(Object.entries(postData)),
		headers: {
			accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			"accept-language": "id,en-US;q=0.9,en;q=0.8",
			"content-type": "application/x-www-form-urlencoded",
			cookie: sess,
			"user-agent": ua,
		},
	});
	const cheerMp3 = cheerio.load(resMp3.data);
	cheerMp3("div.row")
		.find("a")
		.each((a, b) => {
			let rex =
				/(?:https:?\/{2})?(?:w{3}|v[0-9]|[a-zA-Z0-9])\.?(?:muscdn|tiktokcdn|musicaldown)\.?(?:com|xyz)([^\s&]+)/gi;
			let c = cheerMp3(b).attr("href");
			if (rex.test(c)) {
				metadata["mp3"].push(c);
			}
		});
	return metadata;
}

class Downloader extends igdl {
	/**
	 * Download from Twitter
	 * @param {String} url Twitter URL
	 */
	async getInfo(url) {
		const id = getID(url);
		if (id) {
			let token = "";
			try {
				const { data: tokenResponse } = await request(API_GUEST, {
					method: "POST",
					headers: { authorization: AUTH },
				});
				token = tokenResponse.guest_token;
			} catch (e) {
				throw new Error(e);
			}
			const { data: response } = await request(Util.format(API_TIMELINE, id), {
				method: "GET",
				headers: { "x-guest-token": token, authorization: AUTH },
			});

			if (!response["globalObjects"]["tweets"][id]["extended_entities"]) throw new Error("No media");
			const media = response["globalObjects"]["tweets"][id]["extended_entities"]["media"];
			if (media[0].type === "video")
				return {
					type: media[0].type,
					full_text: response["globalObjects"]["tweets"][id]["full_text"],
					variants: media[0]["video_info"]["variants"],
				};
			if (media[0].type === "photo")
				return {
					type: media[0].type,
					full_text: response["globalObjects"]["tweets"][id]["full_text"],
					variants: media.map((x) => x.media_url_https),
				};
			if (media[0].type === "animated_gif")
				return {
					type: media[0].type,
					full_text: response["globalObjects"]["tweets"][id]["full_text"],
					variants: media[0]["video_info"]["variants"],
				};
		} else {
			throw new Error("Not a Twitter URL");
		}
	}
	/**
	 * Download Facebook Video
	 * @param {String} url Facebook post
	 */
	async fbdl(url) {
		let token,
			result,
			agent = UserAgent();
		try {
			// get token
			token = await request("https://downvideo.net", {
				method: "GET",
				headers: {
					accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
					"accept-language": `id,en-US;q=0.9,en;q=0.8,es;q=0.7,ms;q=0.6`,
					"sec-fetch-user": `?1`,
					"User-Agent": agent,
				},
			});
			const $token = cheerio.load(token.data);
			token = $token('input[name="token"]').attr("value") ?? null;
			// post data
			result = await request("https://downvideo.net/download.php", {
				data: new URLSearchParams(Object.entries({ URL: url, token })),
				method: "POST",
				headers: {
					accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
					"accept-language": `id,en-US;q=0.9,en;q=0.8,es;q=0.7,ms;q=0.6`,
					"sec-fetch-user": `?1`,
					"content-type": `application/x-www-form-urlencoded`,
					"User-Agent": agent,
				},
			});
			const $rootDl = cheerio.load(result.data);
			result = [];
			$rootDl('div[class="col-md-10"]')
				.find("a")
				.each((a, b) => {
					let dl = $rootDl(b).attr("href");
					let rex = /(?:https:?\/{2})?(?:[a-zA-Z0-9])\.xx\.fbcdn\.net/;
					if (rex.test(dl)) {
						result.push(dl);
					}
				});
		} catch (e) {
			throw e.message;
		} finally {
			return result;
		}
	}
	/**
	 * Download TikTok Video
	 * @param {string} url TikTok video link
	 */
	async ttdl(url) {
		try {
			let meta = await getTokenAndSess();
			let keys = Object.keys(meta.metadata);
			let a = {};
			for (let mt of keys) {
				a[mt] = meta.metadata[mt];
				if (meta.metadata[mt] === "") {
					a[mt] = url;
				}
			}
			let res = await muiscallyPost(a, meta.cookie, meta.ua);
			return res;
		} catch (e) {
			throw new Error("Can't get metadata from given URL");
		}
	}
}

module.exports = Downloader;
