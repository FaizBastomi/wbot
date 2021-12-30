const fs = require('fs');
const { getRandom } = require('../../utils');
const { webp2mp4 } = require("../../utils/uploader");
const { downloadMedia } = require("../../utils");
const lang = require('../other/text.json');
const run = require('child_process').exec;

module.exports = {
    name: 'toimage',
    alias: ['toimg', 'tomedia', 'tovid', 'tovideo'],
    category: 'general',
    desc: 'Convert your sticker to media (image)',
    async exec(msg, sock) {
        const { quoted, from, type } = msg;

        const content = JSON.stringify(quoted);
        const isQStick = type === 'extendedTextMessage' && content.includes('stickerMessage');
        const QStickEph = type === 'ephemeralMessage' && content.includes('stickerMessage');

        if (
            (isQStick && quoted.message.stickerMessage.isAnimated === false) ||
            (QStickEph && quoted.message.stickerMessage.isAnimated === false)
        ) {
            const ran = getRandom('.webp');
            const ran1 = getRandom('.png');
            const buffer = await downloadMedia(quoted.message);
            await fs.promises.writeFile(`./temp/${ran}`, buffer);
            run(`ffmpeg -i ./temp/${ran} ./temp/${ran1}`, async function (err) {
                fs.unlinkSync(`./temp/${ran}`);
                if (err) return await sock.sendMessage(from, { text: `IND:\n${lang.indo.util.toimg.fail}\n\nEN:\n${lang.eng.util.toimg.fail}` }, { quoted: msg });
                await sock.sendMessage(from, { image: fs.readFileSync(`./temp/${ran1}`), caption: "Done." }, { quoted: msg });
                fs.unlinkSync(`./temp/${ran1}`);
            });
        } else if (
            (isQStick && quoted.message.stickerMessage.isAnimated === true) ||
            (QStickEph && quoted.message.stickerMessage.isAnimated === true)
        ) {
            const ran = getRandom('.webp');
            const data = await downloadMedia(quoted.message);
            fs.writeFile(`./temp/${ran}`, data, async (err) => {
                if (err) await sock.sendMessage(from, { text: `IND:\n${lang.indo.util.toimg.fail}\n\nEN:\n${lang.eng.util.toimg.fail}` }, { quoted: msg }) && fs.unlinkSync(`./temp/${ran}`);
                const ezgif = await webp2mp4(`./temp/${ran}`);
                await sock.sendMessage(from, { video: { url: ezgif } }, { quoted: msg });
                fs.unlinkSync(`./temp/${ran}`);
            })
        } else {
            await sock.sendMessage(from, { text: `IND:\n${lang.indo.util.toimg.msg}\n\nEN:\n${lang.eng.util.toimg.msg}` }, { quoted: msg });
        }
    },
};