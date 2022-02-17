const ytsr = require('yt-search');
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
        let final, data1, data2;
        if (type === "long") {
            data1 = await ytsr(query);
            final = data1.videos;
        } else if (type === "short") {
            data2 = await ytsr(query);
            final = data2.videos.filter((vid) => vid.seconds <= 240)
        }
        data1 = null,
        data2 = null;
        return final;
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
            let vidDetails = postData.medias.filter((r) => r.videoAvailable && r.audioAvailable && r.quality === "360p")[0]
            data = {
                title: postData.title, duration: postData.duration,
                thumb: postData.thumbnail, dl_link: vidDetails.url, q: vidDetails.quality,
                size: Math.floor(vidDetails.size / 1000), sizeF: vidDetails.formattedSize
            }
        } else if (type === "audio") {
            let audioDetails = postData.medias
                .filter((r) => !r.videoAvailable && r.audioAvailable && r.extension === "mp3" && r.quality === "128kbps")[0]
            data = {
                title: postData.title, duration: postData.duration,
                thumb: postData.thumbnail, dl_link: audioDetails.url, q: audioDetails.quality,
                size: Math.floor(parseInt(audioDetails.size) / 1000), sizeF: audioDetails.formattedSize
            }
        }
        postData = null;
        return data;
    }
}
module.exports = YouTube;