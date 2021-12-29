const emojiped = require("../../utils/emojiped");
const { fetchBuffer } = require("../../utils");
const { sticker } = require("../../lib/convert");

module.exports = {
    name: "moji",
    alias: ["emoji"],
    desc: "Convert emoji to sticker.",
    category: "general",
    use: "[provider] <emoji>\n\nProvider:\n- WhatsApp\n- Samsung\n- Apple\n- Google",
    async exec(msg, sock, args) {
        const { from } = msg;
        try {
            if (!args.length > 0) return await sock.sendMessage(from, { text: "Need to specify emoji" }, { quoted: msg });
            if (args.length > 1 && args.length === 2) {
                const links = await emojiped(args.slice(1)[0]);
                let provider = Object.keys(links);
                if (provider.includes(args[0])) {
                    const emojiBuffer = await fetchBuffer(links[args[0]]);
                    const stickerBuffer = await sticker(emojiBuffer, { isImage: true, cmdType: "2" });
                    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
                }
                else {
                    const emojiBuffer = await fetchBuffer(links.whatsapp);
                    const stickerBuffer = await sticker(emojiBuffer, { isImage: true, cmdType: "2" });
                    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
                }
            } else {
                const links = await emojiped(args[0]);
                const emojiBuffer = await fetchBuffer(links.whatsapp);
                const stickerBuffer = await sticker(emojiBuffer, { isImage: true, cmdType: "2" });
                await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
            }
        } catch(e) {
            await sock.sendMessage(from, { text: "Error while processing your emoji" }, { quoted: msg });
        }
    }
}