const { memeText } = require("../../utils/uploader");
const lang = require("../other/text.json");

module.exports = {
    name: "meme",
    category: "general",
    desc: "Add text to image",
    use: "<teks>|<teks>\n\nEx:\n!meme atas|bawah",
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
                const buffer = isQImg ? await quoted.download() : await msg.download();
                let memeImg = await memeText(buffer, top.toString(), bottom.toString());
                await sock.sendMessage(from, { image: memeImg }, { quoted: msg });
            } else if (
                isQDoc && (/image/.test(quoted.message.documentMessage.mimetype))
            ) {
                const buffer = await quoted.download();
                let memeImg = await memeText(buffer, top, bottom);
                await sock.sendMessage(from, { image: memeImg }, { quoted: msg });
            } else {
                await msg.reply(`IND:\n${lang.indo.memeImg}\n\nEN:\n${lang.eng.memeImg}`);
            }
        } catch (e) {
            await msg.reply("Error while creating image");
        }
    }
}