const Jikan = require("jikan-node");
const api = new Jikan();

module.exports = {
    name: "search",
    alias: ["anime"],
    category: "weebs",
    desc: "Search for anime\ndata from myanimelist.net",
    async exec(msg, sock, args) {
        const { from } = msg;
        try {
            if (!args.length > 0) {
                let text = "No title for search\nso, I recommended you some airing anime.";
                const resp = await api.search("anime", "", { status: "airing", page: 1 });
                for (let i = 0; i < 10; i++) {
                    text += `*📕Title:* ${resp.results[i].title}\n*✴️Score:* ${resp.results[i].score}*🔗URL:* ${resp.results[i].url}\n`
                        + `*🔖Episodes:* ${resp.results[i].episodes}\n*🔍MAL ID:* ${resp.results[i].mal_id}\n*🎬Type:* ${resp.results[i].type}\n\n`
                        + `*📋Synopsis:* ${resp.results[i].synopsis === '' ? "No synopsis" : resp.results[i].synopsis}\n*📢Status:* ${resp.results[i].airing ? "airing/to be airing" : "complete"}\n\n`
                }
                await sock.sendMessage(from, { image: { url: resp.results[0].image_url }, caption: text }, { quoted: msg });
            } else {
                let text = `Top 10 search result of: *${args.join(' ')}*`
                const resp = await api.search("anime", args.joion(' '), { page: 1});
                for (let i = 0; i < 10; i++) {
                    text += `*📕Title:* ${resp.results[i].title}\n*✴️Score:* ${resp.results[i].score}*🔗URL:* ${resp.results[i].url}\n`
                        + `*🔖Episodes:* ${resp.results[i].episodes}\n*🔍MAL ID:* ${resp.results[i].mal_id}\n*🎬Type:* ${resp.results[i].type}\n\n`
                        + `*📋Synopsis:* ${resp.results[i].synopsis === '' ? "No synopsis" : resp.results[i].synopsis}\n*📢Status:* ${resp.results[i].airing ? "airing/to be airing" : "complete"}\n\n`
                }
                await sock.sendMessage(from, { image: { url: resp.results[0].image_url }, caption: text }, { quoted: msg });
            }
        } catch (e) {
            await sock.sendMessage(from, { text: `Something bad happen\n${e.message}` }, { quoted: msg });
        }
    }
}