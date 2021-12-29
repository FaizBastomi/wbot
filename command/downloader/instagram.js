const { insta } = require('../../utils/instagram')
const lang = require('../other/text.json')
const axios = require("axios").default;
const errMes = `ID:\n${lang.indo.util.download.igFail}\n\nEN:\n${lang.eng.util.download.igFail}`

module.exports = {
    name: 'igdl',
    alias: ['ig'],
    category: 'downloader',
    desc: 'Download instagram media',
    async exec(msg, sock, args) {
        if (!args.length > 0) return await sock.sendMessage(msg.from, { text: 'Ex: !igdl *instagram_url*' }, { quoted: msg })
        try {
            const ar = await insta(args[0])
            if (ar.uriType === "igHigh") {
                const type = await fastCheck(ar.media[0].url);
                let ext = /image/.test(type) ? { image: { url: ar.media[0].url } } : { video: { url: ar.media[0].url } };
                await sock.sendMessage(msg.from, { ...ext }, { quoted: msg });
            } else if (ar.uriType === "igStory") {
                const type = await fastCheck(ar.media[0].url);
                let ext = /image/.test(type) ? { image: { url: ar.media[0].url } } : { video: { url: ar.media[0].url } };
                await sock.sendMessage(msg.from, { ...ext }, { quoted: msg });
            } else {
                ar.url.map(async (r) => {
                    const type = await fastCheck(r);
                    let ext = /image/.test(type) ? { image: { url: r } } : { video: { url: r } };
                    await sock.sendMessage(msg.from, { ...ext }, { quoted: msg });
                })
            }
        } catch (e) {
            await sock.sendMessage(msg.from, { text: errMes }, { quoted: msg })
        }
    }
}

async function fastCheck(url) {
    const resp = await axios.get(url)
    return resp.headers['content-type']
}