const { downloadMedia, fetchBuffer } = require("../../utils");
const { memeText } = require("../../utils/uploader");
const { sticker } = require("../../lib/convert");
const lang = require("../other/text.json");

module.exports = {
    name: "stikmeme",
    alias: ['stickermeme', 'stikermeme', 'stiktext', 'stickertext', 'stikertext', 'sticktext'],
    category: "general",
    desc: "Create a sticker from image",
    async exec(msg, sock, args, arg) {
        const { quoted, from, type } = msg;

        const content = JSON.stringify(quoted);
        const isMedia = type === 'imageMessage';
        const isQImg = type === 'extendedTextMessage' && content.includes('imageMessage');
        const isQDoc = type === 'extendedTextMessage' && content.includes('documentMessage');
        let top = arg.split('|')[0] || '_';
        let bottom = arg.split('|')[1] || '_';

        try {
            if ((isMedia && !msg.message.videoMessage) || isQImg) {
                const media = isQImg ? quoted.message : msg.message;
                const buffer = await downloadMedia(media);
                let memeImg = await memeText(buffer, top.toString(), bottom.toString());
                const stickerBuffer = await sticker(memeImg, { isImage: true, cmdType: "1" });
                await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
            } else if (
                isQDoc && (/image/.test(quoted.message.documentMessage.mimetype))
            ) {
                const buffer = await downloadMedia(quoted.message);
                let memeImg = await memeText(buffer, top, bottom);
                const stickerBuffer = await sticker(memeImg, { isImage: true, cmdType: "1" });
                await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: `IND:\n${lang.indo.stickmeme}\n\nEN:\n${lang.eng.stickmeme}` }, { quoted: msg });
            }
        } catch (e) {
            await sock.sendMessage(from, { text: "Error while creating sticker" }, { quoted: msg });
        }
    }
}
