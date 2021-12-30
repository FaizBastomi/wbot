const Exif = require("../../utils/exif");
const ex = new Exif();
const fs = require("fs");
const { getRandom } = require("../../utils");
const { sticker } = require("../../lib/convert");
const { downloadMedia } = require("../../utils");
const run = require("child_process").exec;
const lang = require("../other/text.json");

module.exports = {
    name: "swm",
    alias: ['stickerwm', 'stickwm', 'stikerwm', 'stikwm'],
    category: "general",
    desc: "Create sticker with author and packname",
    use: "packname|authorname",
    async exec(msg, sock, args, arg) {
        const { quoted, from, sender, type } = msg;
        let packname = arg.split("|")[0] || "Default";
        let author = arg.split("|")[1] || "SMH BOT";

        const content = JSON.stringify(quoted);
        const isMedia = type === 'imageMessage' || type === 'videoMessage';
        const isQImg = type === 'extendedTextMessage' && content.includes('imageMessage');
        const isQVid = type === 'extendedTextMessage' && content.includes('videoMessage');
        const isQStick = type === 'extendedTextMessage' && content.includes('stickerMessage');
        const isQDoc = type === 'extendedTextMessage' && content.includes('documentMessage');

        try {
            if ((isMedia && !msg.message.videoMessage) || isQImg) {
                const media = isQImg ? quoted.message : msg.message;
                const buffer = await downloadMedia(media);
                const stickerBuffer = await sticker(buffer, {
                    isImage: true, withPackInfo: true, cmdType: "1", packInfo: {
                        packname: packname.toString(),
                        author: author.toString()
                    }
                })
                await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
            } else if (
                (isMedia && msg.message.videoMessage.fileLength < 2 << 20) ||
                (isQVid && quoted.message.videoMessage.fileLength < 2 << 20)
            ) {
                const media = isQVid ? quoted.message : msg.message;
                const buffer = await downloadMedia(media);
                const stickerBuffer = await sticker(buffer, {
                    isVideo: true, withPackInfo: true, cmdType: "1", packInfo: {
                        packname: packname.toString(),
                        author: author.toString()
                    }
                })
                await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
            } else if (isQStick) {
                const name_1 = getRandom('.webp');
                ex.create(packname.toString(), author.toString(), sender);
                const buffer = await downloadMedia(quoted.message);
                await fs.promises.writeFile(`./temp/${name_1}`, buffer);
                run(`webpmux -set exif ./temp/${sender}.exif ./temp/${name_1} -o ./temp/${name_1}`, async function (e) {
                    if (e) return await sock.sendMessage(from, { text: "Error" }, { quoted: msg }) && fs.unlinkSync(`./temp/${name_1}`);
                    await sock.sendMessage(from, { sticker: `./temp/${name_1}` }, { quoted: msg });
                    fs.unlinkSync(`./temp/${name_1}`);
                    fs.unlinkSync(`./temp/${sender}.exif`);
                })
            } else if (
                isQDoc && (/image/.test(quoted.message.documentMessage.mimetype) ||
                    (/video/.test(quoted.message.documentMessage.mimetype) && quoted.message.documentMessage.fileLength < 2 << 20))
            ) {
                let ext = /image/.test(quoted.message.documentMessage.mimetype) ? { isImage: true } : /video/.test(quoted.message.documentMessage.mimetype) ? { isVideo: true } : null;
                if (!ext) return await sock.sendMessage(from, { text: "Document mimetype unknown" }, { quoted: msg });
                const buffer = await downloadMedia(quoted.message);
                const stickerBuffer = sticker(buffer, {
                    ...ext, withPackInfo: true, cmdType: "1", packInfo: {
                        packname: packname.toString(),
                        author: author.toString()
                    }
                });
                await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: `IND:\n${lang.indo.stick}\n\nEN:\n${lang.eng.stick}` }, { quoted: msg });
            }
        } catch (e) {
            await sock.sendMessage(from, { text: "Error while creating sticker" }, { quoted: msg });
        }
    }
}