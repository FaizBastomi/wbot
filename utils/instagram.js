/* Module */
const { default: axios } = require("axios");
const Util = require("util");
const { fixNumber } = require(".");
const { igCookie } = require("../config.json");
const YouTube = require("./youtube");

/* Instagram API */
const highlight = "https://i.instagram.com/api/v1/feed/reels_media/?reel_ids=%s";
const story = "https://i.instagram.com/api/v1/feed/user/%s/reel_media/";
const profile = "https://instagram.com/%s?__a=1";
const cookie = igCookie;
const UA = "Instagram 10.3.2 (iPhone7,2; iPhone OS 9_3_3; en_US; en-US; scale=2.00; 750x1334) AppleWebKit/420+";

const req = async (url, options) => {
	let res = await axios({
		url,
		...options,
	});
	return res.data;
};

/**
 * Get all story media based on given user id
 * @param {String} userId Instagram user id
 */
const getStory = async (userId) => {
	let res = await axios.get(Util.format(story, userId), {
		headers: {
			"User-Agent": UA,
			cookie,
		},
	});
	return res.data.items;
};

/**
 * Get all highlight media based on given highlight id
 * @param {String} highId highlight id
 */
const getHighReels = async (highId) => {
	let res = await axios.get(Util.format(highlight, highId), {
		headers: {
			"User-Agent": UA,
			cookie,
		},
	});
	return res.data.reels[highId].items;
};

function igStory(url) {
	return new Promise(async (resolve, reject) => {
		try {
			const parsed = new URL(url);
			let media_id = parsed.pathname.split("/").filter((v) => v)[2];
			let username = parsed.pathname.split("/").filter((v) => v)[1];
			let res = await req(`${parsed.origin}/${username}` + "?__a=1", {
				headers: {
					cookie,
				},
			});
			let res2 = await getStory(res.graphql.user.id);
			let tmp;
			let metadata = {};
			for (const idx in res2) {
				if (res2[idx].id.includes(media_id)) {
					tmp = res2[idx];
				}
			}
			metadata["uriType"] = "igStory";
			metadata["type"] = { 1: "photo", 2: "video" }[tmp.media_type];
			metadata["media"] = { 1: tmp.image_versions2.candidates, 2: tmp.video_versions }[tmp.media_type];
			resolve(metadata);
		} catch (e) {
			reject(e);
		}
	});
}

function igHighlight(url) {
	return new Promise(async (resolve, reject) => {
		try {
			const parsed = new URL(url);
			let media_id = parsed.searchParams.get("story_media_id");
			let res = await axios.request({
				url,
				headers: {
					cookie,
				},
			});
			let parsed2 = new URL(res.request.res.responseUrl);
			let highId = parsed2.pathname.split("/").filter((v) => v)[2];
			const res2 = await getHighReels(`highlight:${highId}`);
			let tmp;
			let metadata = {};
			for (const idx in res2) {
				if (res2[idx].id == media_id) {
					tmp = res2[idx];
				}
			}
			metadata["uriType"] = "igHigh";
			metadata["type"] = { 1: "photo", 2: "video" }[tmp.media_type];
			metadata["media"] = { 1: tmp.image_versions2.candidates, 2: tmp.video_versions }[tmp.media_type];
			resolve(metadata);
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * Instagram Post
 * @param {String} url IgPost url
 */
async function igPost(url) {
	try {
		const uri = url.replace(/\?.*$/g, "") + "?__a=1";
		const { data } = await axios.get(uri, {
			headers: {
				cookie,
			},
		});
		if (data.hasOwnProperty("graphql")) {
			const type = data.graphql.shortcode_media.__typename;
			const metadata = {
				type,
				uriType: "igPost",
				url: [],
			};

			if (type === "GraphImage") {
				metadata.url.push(data.graphql.shortcode_media.display_url);
			} else if (type === "GraphVideo") {
				metadata.url.push(data.graphql.shortcode_media.video_url);
			} else if (type === "GraphSidecar") {
				data.graphql.shortcode_media.edge_sidecar_to_children.edges.map((r) => {
					if (r.node.__typename === "GraphImage") metadata.url.push(r.node.display_url);
					if (r.node.__typename === "GraphVideo") metadata.url.push(r.node.video_url);
				});
			}
			return metadata;
		} else if (data.hasOwnProperty("items")) {
			const metadata = { uriType: "igPost", url: [] };
			const mediaTypeMap = {
				1: "image",
				2: "video",
				8: "carousel",
			}[data.items[0].media_type];
			// Filtering Process
			if (mediaTypeMap === "image") {
				const dl_link = data.items[0].image_versions2?.candidates?.[0]?.url;
				metadata["url"].push(dl_link);
			} else if (mediaTypeMap === "video") {
				const dl_link = data.items[0].video_versions?.[0]?.url;
				metadata["url"].push(dl_link);
			} else if (mediaTypeMap === "carousel") {
				const dl_link = data.items[0].carousel_media.map((fd) => {
					// Filtering Process for Multi-photo/Multi-video
					const data_1 = {
						1: fd.image_versions2?.candidates?.[0]?.url,
						2: fd.video_versions?.[0]?.url,
					}[fd.media_type];
					return data_1;
				});
				metadata["url"] = dl_link;
			}
			// Result
			return metadata;
		} else {
			throw Error("Post not found or private");
		}
	} catch (e) {
		throw e;
	}
}

class igdl extends YouTube {
	/**
	 * Get Instagram User Profile Info
	 * @param {String} username Instagram Username
	 */
	async igProfile(username) {
		return new Promise(async (resolve, reject) => {
			try {
				const res = await req(Util.format(profile, username), {
					method: "GET",
					headers: {
						cookie,
					},
				});
				if (res.hasOwnProperty("graphql")) {
					let metadata = {
						name: res.graphql.user.full_name,
						username: res.graphql.user.username,
						bio: res.graphql.user.biography,
						ex_url: res.graphql.user.external_url,
						follower: fixNumber(res.graphql.user.edge_followed_by.count),
						following: fixNumber(res.graphql.user.edge_follow.count),
						private: res.graphql.user.is_private ? "yes" : "no",
						verified: res.graphql.user.is_verified ? "✅" : "❌",
					};
					let picUrl = {
						hd: res.graphql.user.profile_pic_url_hd,
						sd: res.graphql.user.profile_pic_url,
					};
					resolve({ metadata, picUrl });
				} else {
					reject(new Error("User not found"));
				}
			} catch (e) {
				reject(e);
			}
		});
	}
	/**
	 * Download Instagram Media
	 * @param {String} url Instagram post url
	 */
	async insta(url) {
		let rex1 = /(?:\/p\/|\/reel\/|\/tv\/)([^\s&]+)/;
		let rex2 = /\/s\/([^\s&]+)/;
		let rex3 = /\/stories\/([^\s&]+)/;

		if (rex1.test(url)) {
			return igPost(url);
		} else if (rex2.test(url)) {
			return igHighlight(url);
		} else if (rex3.test(url)) {
			return igStory(url);
		} else {
			throw "Invalid URL or not supported";
		}
	}
}

module.exports = igdl;
