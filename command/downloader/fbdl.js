const { fbdl } = require("../../utils/downloader")
const lang = require("../other/text.json")

const errMess = `ID:\n${lang.indo.util.download.fbFail}\n\nEN:\n${lang.eng.util.download.fbFail}`

module.exports = {
    name: "fb",
    alias: ["fbdl", "facebook", "fbvid"],
    category: "downloader",
    desc: "Download Facebook video",
    async exec(msg, sock, args) {
        try {
            if (!args.length > 0) return await msg.reply("No url provided");
            let data = await fbdl(args[0])

            if (data.length === 0) return await msg.reply(`ID:\n${lang.indo.util.download.fbPriv}\n\nEN:\n${lang.eng.util.download.fbPriv}`);
            await sock.sendMessage(msg.from, { video: { url: data[0] } }, { quoted: msg })
        } catch (e) {
            await msg.reply(errMess);
        }
    }
}
