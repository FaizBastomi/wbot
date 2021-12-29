const { yta } = require('../../utils/youtube')
const { fetchText, textParse } = require('../../utils')
const lang = require('../other/text.json')
const { validateURL } = require('../../utils/youtube-url-utils')

module.exports = {
    name: 'yta',
    alias: ['ytmp3', 'ytaudio'],
    category: 'downloader',
    desc: 'Download YouTube Audio',
    async exec(msg, sock, args) {
        try {
            if (args.length < 1) return await sock.sendMessage(msg.from, { text: `URL not provided` }, { quoted: msg })
            let { url, opt } = textParse(args.join(" "))
            if (!validateURL(url)) return await sock.sendMessage(msg.from, { text: lang.eng.util.download.notYTURL }, { quoted: msg })
            await sock.sendMessage(msg.from, { text: `IND:\n${lang.indo.util.download.progress}\n\nEN:\n${lang.eng.util.download.progress}` }, { quoted: msg })

            const res = await yta(url)
            switch (opt) {
                case "--doc":
                    if (res.filesize >= 15 << 10) {
                        let short = await fetchText(`https://tinyurl.com/api-create.php?url=${res.dl_link}`)
                        let capt = `*Title:* ${res.title}\n`
                            + `*ID:* ${res.id}\n*Quality:* ${res.q}\n*Size:* ${res.filesizeF}\n*Download:* ${short}\n\n_Filesize to big_`
                        await sock.sendMessage(msg.from, { image: { url: res.thumb }, caption: capt }, { quoted: msg })
                    } else {
                        await sock.sendMessage(msg.from, { document: { url: res.dl_link }, mimetype: "audio/mp4", filename: res.title + ".mp3" }, { quoted: msg })
                    }
                    break
                case "--ptt":
                    if (res.filesize >= 15 << 10) {
                        let short = await fetchText(`https://tinyurl.com/api-create.php?url=${res.dl_link}`)
                        let capt = `*Title:* ${res.title}\n`
                            + `*ID:* ${res.id}\n*Quality:* ${res.q}\n*Size:* ${res.filesizeF}\n*Download:* ${short}\n\n_Filesize to big_`
                        await sock.sendMessage(msg.from, { image: { url: res.thumb }, caption: capt }, { quoted: msg })
                    } else {
                        await sock.sendMessage(msg.from, { audio: { url: res.dl_link }, ptt: true, mimetype: "audio/mp4" }, { quoted: msg })
                    }
                    break
                default:
                    if (res.filesize >= 15 << 10) {
                        let short = await fetchText(`https://tinyurl.com/api-create.php?url=${res.dl_link}`)
                        let capt = `*Title:* ${res.title}\n`
                            + `*ID:* ${res.id}\n*Quality:* ${res.q}\n*Size:* ${res.filesizeF}\n*Download:* ${short}\n\n_Filesize to big_`
                        await sock.sendMessage(msg.from, { image: { url: res.thumb }, caption: capt }, { quoted: msg })
                    } else {
                        await sock.sendMessage(msg.from, { audio: { url: res.dl_link }, mimetype: "audio/mp4" }, { quoted: msg })
                    }
            }

        } catch (e) {
            console.log(e)
            await sock.sendMessage(msg.from, { text: 'Something went wrong, check back later.' }, { quoted: msg })
        }
    }
}
