const { uploaderAPI } = require("../../utils/uploader");

module.exports = {
    name: "upload",
    alias: ["upld"],
    use: "*<hosting>*\nSend/Reply to a message media with caption\n\n"
        + "*Hosting*\n- telegraph\n- uguu\n- anonfiles",
    category: "misc",
    async exec(msg, sock, args) {
        const { from, quoted, type } = msg;
        try {
            let host = args[0];
            const content = JSON.stringify(quoted);
            const isMed = type === "imageMessage" || type === "videoMessage"
            const isQMed = type === "extendedTextMessage" && (content.includes("imageMessage") || content.includes("videoMessage"));
            if (host === "" || !host) host = "telegraph";

            let resUrl;
            if (quoted && isQMed) {
                resUrl = await uploaderAPI((await quoted.download()), host);
                await sock.sendMessage(from, { text: `*Host:* ${resUrl.host}\n*URL:* ${resUrl.data.url}\n*Name:* ${resUrl.data.name}\n*Size:* ${resUrl.data.size}` }, { quoted: msg });
            } else if (isMed) {
                resUrl = await uploaderAPI((await msg.download()), host);
                await sock.sendMessage(from, { text: `*Host:* ${resUrl.host}\n*URL:* ${resUrl.data.url}\n*Name:* ${resUrl.data.name}\n*Size:* ${resUrl.data.size}` }, { quoted: msg });
            } else {
                await msg.reply("No media message found.\nDocument message currently not supported.");
            }
        } catch (e) {
            await msg.reply(`Error: ${e.message}`);
        }
    }
}