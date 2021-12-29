const { ttdl } = require('../../utils/ttdl');
const lang = require('../other/text.json');

const errMess = `ID:\n${lang.indo.util.download.ttFail}\n\nEN:\n${lang.eng.util.download.ttFail}`

module.exports = {
    name: 'ttdl',
    alias: ['tiktok', 'tt', 'tiktokdl', 'tiktokmusic', 'tiktoknowm', 'tiktokwm', 'ttwm',
        'ttnowm', 'ttmusic'],
    category: "downloader",
    desc: 'Download TikTok Video',
    use: "[options] url\n\n- *Options* -\n\n1. audio\n2. video\n\nEx: !tiktok audio url",
    async exec(msg, sock, args) {
        try {
            let opt = args[0]
            const { url } = parse(args.join(' '))
            if (url === '') { return await sock.sendMessage(msg.from, { text: 'No valid URL detected' }, { quoted: msg }) }
            let data;
            switch (opt) {
                case "audio": case "music":
                    data = await ttdl(url)
                    await sock.sendMessage(msg.from, { audio: { url: data.mp3[data.mp3.length - 1] }, mimetype: "audio/mp4" }, { quoted: msg })
                    break;
                case "video":
                    data = await ttdl(url)
                    await sock.sendMessage(msg.from, { video: { url: data.mp4[data.mp4.length - 1] } }, { quoted: msg })
                    break;
                default:
                    data = await ttdl(url)
                    await sock.sendMessage(msg.from, { video: { url: data.mp4[data.mp4.length - 1] } }, { quoted: msg })
            }
        } catch (e) {
            await sock.sendMessage(msg.from, { text: errMess }, { quoted: msg })
        }
    }
}

const parse = (text) => {
    const rex = /(?:https:?\/{2})?(?:w{3}|vm|vt|t)?\.?tiktok.com\/([^\s&]+)/gi
    const url = text.match(rex)
    return { url: url == null ? '' : url[0] }
}
