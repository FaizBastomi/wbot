const { fetchJson } = require("../../utils");

module.exports = {
    name: "yuri",
    category: "weebs",
    desc: "Yuri anime image",
    async exec(msg, sock) {
        try {
            let list = ['yuri', 'eroyuri']
            const { url } = await fetchJson(`https://nekos.life/api/v2/img/${list[~~(Math.random() * list.length)]}`);
            await sock.sendMessage(msg.from, { image: { url } }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(msg.from, { text: `Something bad happend\n${e.message}` }, { quoted: msg });
        }
    }
}