const ytsr = require('ytsr');
const ax = require("axios").default;
const cheer = require("cheerio");
const { UserAgent } = require("./index");

class YouTube {
    /**
     * Search on YouTube
     * @param {String} query Query to search
     * @param {"long"|"short"} type short or long duration
     */
    async yts(query, type) {
        if (!type) type = "short";
        const fi = await ytsr.getFilters(query);
        const fi_1 = fi.get('Type').get('Video');
        let final;
        switch (type) {
            case 'short': {
                const fi_2 = await ytsr.getFilters(fi_1.url);
                const fi_3 = fi_2.get('Duration').get('Under 4 minutes');
                final = await ytsr(fi_3.url, { limit: 20 });
                break;
            }
            case 'long': {
                final = await ytsr(fi_1.url, { limit: 20 });
                break;
            }
        }
        return final.items;
    }
    /**
     * Download from YouTube
     * @param {String} url YouTube video url
     * @param {String} type video or audio
     */
    async yt(url, type) {
        let agent = UserAgent()
        let webData = await ax.get("https://aiovideodl.ml", { "headers": { "User-Agent": agent } });
        const $ = cheer.load(webData.data);
        let token = $("#token").attr("value");
        let data;
        let { data: postData } = await ax.post("https://aiovideodl.ml/wp-json/aio-dl/video-data/", new URLSearchParams(Object.entries({ url, token })), {
            "headers": {
                "User-Agent": agent,
                "cookie": webData.headers["set-cookie"][1],
                "content-type": "application/x-www-form-urlencoded",
                "accept-language": "id,en-US;q=0.9,en;q=0.8,es;q=0.7,ms;q=0.6",
                "origin": "https://aiovideodl.ml",
                "referer": "https://aiovideodl.ml/"
            },
            responseType: "json"
        });
        if (type === "video") {
            let vidDetails = postData.medias.filter((r) => r.videoAvailable && r.audioAvailable && r.quality === "720p")[0]
            if (!vidDetails) vidDetails = postData.medias.filter((r) => r.videoAvailable && r.audioAvailable && r.quality === "360p")[0]
            data = {
                title: postData.title, duration: postData.duration,
                thumb: postData.thumbnail, dl_link: vidDetails.url, q: vidDetails.quality,
                size: Math.floor(vidDetails.size / 1000), sizeF: vidDetails.formattedSize
            }
        } else if (type === "audio") {
            let audioDetails = postData.medias.filter((r) => !r.videoAvailable && r.audioAvailable && r.quality === "128kbps")[0]
            data = {
                title: postData.title, duration: postData.duration,
                thumb: postData.thumbnail, dl_link: audioDetails.url, q: audioDetails.quality,
                size: Math.floor(parseInt(audioDetails.size) / 1000), sizeF: audioDetails.formattedSize
            }
        }
        return data;
    }
}
module.exports = YouTube;