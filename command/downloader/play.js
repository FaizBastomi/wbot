const { generateWAMessageFromContent, proto } = require("@adiwajshing/baileys");
const { search, yta } = require('../../utils/downloader');
const { fetchBuffer, fetchText } = require('../../utils');

module.exports = {
    name: 'play',
    category: 'downloader',
    desc: 'Play media from YouTube.',
    async exec(msg, sock, args) {
        const { from } = msg
        if (args.length < 1) return await msg.reply('No query given to search.');
        const s = await search(args.join(' '), 'short')
        if (s.length === 0) return await msg.reply("No video found for that keyword, try another keyword");
        const b = await fetchBuffer(`https://i.ytimg.com/vi/${s[0].id}/0.jpg`)
        const res = await yta(s[0].url)
        // message struct
        let prep = generateWAMessageFromContent(from, proto.Message.fromObject({
            buttonsMessage: {
                locationMessage: { jpegThumbnail: b.toString("base64") },
                contentText: `📙 Title: ${s[0].title}\n📎 Url: ${s[0].url}\n🚀 Upload: ${s[0].uploadedAt}\n\nWant a video version? click button below, or you don\'t see it? type *!ytv youtube_url*\n\nAudio on progress....`,
                footerText: " Kaguya PublicBot • FaizBastomi",
                headerType: 6,
                buttons: [{ buttonText: { displayText: "Video" }, buttonId: `#ytv ${s[0].url} SMH`, type: 1 }]
            }
        }), { timestamp: new Date() })
        // Sending message
        await sock.relayMessage(from, prep.message, { messageId: prep.key.id }).then(async () => {
            try {
                if (res.filesize >= 10 << 10) {
                    let short = await fetchText(`https://tinyurl.com/api-create.php?url=${res.dl_link}`);
                    let capt = `*Title:* ${res.title}\n`
                        + `*ID:* ${res.id}\n*Quality:* ${res.q}\n*Size:* ${res.filesizeF}\n*Download:* ${short}\n\n_Filesize to big_`
                    await sock.sendMessage(from, { image: { url: res.thumb }, caption: capt }, { quoted: prep });
                } else {
                    await sock.sendMessage(from, { audio: (await fetchBuffer(res.dl_link, { skipSSL: true })), mimetype: "audio/mp4" }, { quoted: prep });
                }
            } catch (e) {
                console.log(e)
                await msg.reply("Something wrong when sending the file");
            }
        })
    }
}