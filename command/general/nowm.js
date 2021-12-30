const fs = require("fs");
const { getRandom } = require("../../utils");
const { downloadContentFromMessage } = require("@adiwajshing/baileys-md");
const run = require("child_process").exec;

module.exports = {
    name: "nowm",
    alias: ['delwm', 'wmdel'],
    category: "general",
    desc: "Erase authorname, packanme and link 'view more'",
    async exec(msg, sock) {
        const { quoted, type, from } = msg;
        const content = JSON.stringify(quoted);
        const QStick = type === 'extendedTextMessage' && content.includes('stickerMessage');
        const QStickEph = type === 'ephemeralMessage' && content.includes('stickerMessage');

        try {
            if (QStick || QStickEph) {
                const ran = getRandom('.webp');
                const ran1 = getRandom('.webp');
                const buffer = await downloadMedia(quoted.message.stickerMessage, "sticker");
                await fs.promises.writeFile(`./temp/${ran}`, buffer);
                run(`webpmux -set exif ./temp/d.exif ./temp/${ran} -o ./temp/${ran1}`, async function (err) {
                    fs.unlinkSync(`./temp/${ran}`);
                    if (err) return await sock.sendMessage(from, { text: "Error while creating sticker" }, { quoted: msg });
                    await sock.sendMessage(from, { sticker: { url: `./temp/${ran1}` } }, { quoted: msg });
                    fs.unlinkSync(`./temp/${ran1}`);
                })
            } else {
                await sock.sendMessage(from, { text: "Please, reply to a sticker" }, { quoted: msg });
            }
        } catch (e) {
            await sock.sendMessage(from, { text: "Error while creating sticker" }, { quoted: msg });
        }
    }
}

async function downloadMedia(message, type) {
    const stream = await downloadContentFromMessage(message, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}