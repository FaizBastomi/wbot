const axios = require("axios").default;

module.exports = {
    name: "search",
    alias: ["anime"],
    category: "weebs",
    desc: "Search for anime\ndata from myanimelist.net",
    async exec(msg, sock, args) {
        const { from } = msg;
        try {
            if (!args.length > 0) return msg.reply("No Anime title for search");
            const searchRes = await search(args.join(" "));
            await sock.sendMessage(from, { image: { url: searchRes.image }, caption: searchRes.data });
        } catch (e) {
            await sock.sendMessage(from, { text: `Something bad happen\n${e.message}` }, { quoted: msg });
        }
    }
}

/**
 * Search anime via api.jikan.moe
 * @param {String} query Anime to search
 * @returns 
 */
const search = (query) => {
    return new Promise(async (resolve, reject) => {
        let data2;
        try {
            const { data } = (await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`)).data
            let data3 = `*📕Title:* ${data[0].title}/${data[0].title_english}/${data[0].title_japanese}\n*🔖Trailer:* ${data[0].trailer.url}\n`
            + `*🔍MAL_ID:* ${data[0].mal_id}\n*✴️Type:* ${data[0].type}\n*🎬Episode(s):* ${data[0].episodes}\n*📢Airing:* ${data[0].status}\n*🔔Date:* ${data[0].aired.string}\n`
            + `*🔱Rating:* ${data[0].rating}\n*⚜️Duration:* ${data[0].duration}\n*♨️Score:* ${data[0].score}\n*Studio(s):* ${data[0].studios.map((val) => `${val.name}`).join(", ")}\n`
            + `*🎞️Genre(s):* ${data[0].genres.map((val) => `${val.name}`).join(", ")}\n*📚Synopsis:* ${data[0].synopsis}`
            data2 = {
                image: data[0].images.jpg.image_url,
                data: data3
            }
        } catch(e) {
            reject(e);
        } finally {
            resolve(data2);
        }
    })
}