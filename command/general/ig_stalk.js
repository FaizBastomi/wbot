const { igProfile } = require("../../utils/instagram");

module.exports = {
    name: "igstalk",
    alias: ["igprofile"],
    category: "general",
    use: "<username>",
    async exec(msg, sock, args) {
        try {
            if (!args.length > 0) return await sock.sendMessage(msg.from, { text: "Instagram username required!" }, { quoted: msg });
            const profile = await igProfile(args[0]);
            let text = Object.keys(profile.metadata).map((str) => `${str}: ${profile.metadata[str]}`).join('\n');
            await sock.sendMessage(msg.from, { image: { url: profile.picUrl.hd }, caption: text }, { quoted: msg });
        }
        catch (e) {
            await sock.sendMessage(msg.from, { text: `${e}` }, { quoted: msg });
        }
    }
}