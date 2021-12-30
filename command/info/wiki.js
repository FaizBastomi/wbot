const wiki = require("../../utils/wiki");

module.exports = {
    name: "wiki",
    alias: ["wk"],
    desc: "Search on Wikipedia\nLang: id and en",
    use: "[en|id] <query>",
    category: "information",
    async exec(msg, sock, args) {
        const { from } = msg
        if (!args.length > 0) return await sock.sendMessage(from, { text: 'No query given to search' }, { quoted: msg });
        try {
            const lang = args[0];
            switch (lang) {
                case 'en': {
                    let text = await wiki(args.slice(1).join(" "), "en");
                    await sock.sendMessage(from, { text }, { quoted: msg });
                    break;
                }
                case 'id': {
                    let text = await wiki(args.slice(1).join(" "), "id");
                    await sock.sendMessage(from, { text }, { quoted: msg });
                    break;
                }
                default:
                    let text = await wiki(args.join(" "), "id");
                    await sock.sendMessage(from, { text }, { quoted: msg });
                    break;
            }
        } catch {
            await sock.sendMessage(from, { text: "Something bad happend" });
        }
    }
}