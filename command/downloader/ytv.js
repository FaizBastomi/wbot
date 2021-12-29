const { ytv } = require('../../utils/youtube')
const { fetchText, textParse, fetchBuffer } = require('../../utils')
const lang = require('../other/text.json')
const { validateURL } = require('../../utils/youtube-url-utils')

module.exports = {
    name: 'ytv',
    alias: ['ytmp4', 'ytvid', 'ytvideo'],
    category: 'downloader',
    desc: 'Download YouTube Video',
    async exec(msg, sock, args) {
        try {
            if (args.length < 1) return await sock.sendMessage(msg.from, { text: `URL not provided` }, { quoted: msg })
            let { url, opt } = textParse(args.join(" "))
            if (!validateURL(url)) return await sock.sendMessage(msg.from, { text: lang.eng.util.download.notYTURL }, { quoted: msg })
            await sock.sendMessage(msg.from, { text: `IND:\n${lang.indo.util.download.progress}\n\nEN:\n${lang.eng.util.download.progress}` }, { quoted: msg })

            const res = await ytv(url)
            switch (opt) {
                case "--doc":
                    if (res.filesize >= 30 << 10) {
                        let short = await fetchText(`https://tinyurl.com/api-create.php?url=${res.dl_link}`)
                        let capt = `*Title:* ${res.title}\n`
                            + `*ID:* ${res.id}\n*Quality:* ${res.q}\n*Size:* ${res.filesizeF}\n*Download:* ${short}\n\n_Filesize to big_`
                        await sock.sendMessage(msg.from, { image: { url: res.thumb }, caption: capt }, { quoted: msg })
                    } else {
                        await sock.sendMessage(msg.from, { document: { url: res.dl_link }, mimetype: 'video/mp4', filename: res.title + ".mp4" }, { quoted: msg })
                    }
                    break
                default:
                    if (res.filesize >= 30 << 10) {
                        let short = await fetchText(`https://tinyurl.com/api-create.php?url=${res.dl_link}`)
                        let capt = `*Title:* ${res.title}\n`
                            + `*ID:* ${res.id}\n*Quality:* ${res.q}\n*Size:* ${res.filesizeF}\n*Download:* ${short}\n\n_Filesize to big_`
                        await sock.sendMessage(msg.from, { image: { url: res.thumb }, caption: capt }, { quoted: msg })
                    } else {
                        let capt = `Title: ${res.title}\nSize: ${res.filesizeF}`
                        await sock.sendMessage(msg.from, { video: { url: res.dl_link }, mimetype: 'video/mp4', caption: capt }, { quoted: msg })
                    }
            }
        } catch (e) {
            console.log(e)
            await sock.sendMessage(msg.from, { text: 'Something went wrong, check back later.' }, { quoted: msg })
        }
    }
}
