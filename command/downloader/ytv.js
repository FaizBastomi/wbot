const { ytv } = require('../../utils/downloader');
const { fetchText, textParse, fetchBuffer } = require('../../utils');
const lang = require('../other/text.json');
const { validateURL } = require('../../utils/youtube-url-utils');

module.exports = {
    name: 'ytv',
    alias: ['ytmp4', 'ytvid', 'ytvideo'],
    category: 'downloader',
    desc: 'Download YouTube Video',
    async exec(msg, sock, args) {
        try {
            if (args.length < 1) return await msg.reply(`URL not provided`);
            let { url, opt } = textParse(args.join(" "))
            if (!validateURL(url)) return await msg.reply(lang.eng.util.download.notYTURL);
            await msg.reply(`IND:\n${lang.indo.util.download.progress}\n\nEN:\n${lang.eng.util.download.progress}`);

            const res = await ytv(url)
            switch (opt) {
                case "--doc":
                    if (res.filesize >= 30 << 10) {
                        let short = await fetchText(`https://tinyurl.com/api-create.php?url=${res.dl_link}`)
                        let capt = `*Title:* ${res.title}\n`
                            + `*ID:* ${res.id}\n*Quality:* ${res.q}\n*Size:* ${res.filesizeF}\n*Download:* ${short}\n\n_Filesize to big_`
                        await sock.sendMessage(msg.from, { image: { url: res.thumb }, caption: capt }, { quoted: msg })
                    } else {
                        await sock.sendMessage(msg.from, { document: (await fetchBuffer(res.dl_link, { skipSSL: true })), mimetype: 'video/mp4', fileName: res.title + ".mp4" }, { quoted: msg })
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
                        await sock.sendMessage(msg.from, { video: (await fetchBuffer(res.dl_link, { skipSSL: true })), mimetype: 'video/mp4', caption: capt }, { quoted: msg })
                    }
            }
        } catch (e) {
            console.log(e)
            await msg.reply('Something went wrong, check back later.');
        }
    }
}
