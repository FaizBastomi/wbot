const { fetchJson } = require("../../utils");

module.exports = {
	name: "neko",
	limit: true,
	consume: 1,
	category: "weebs",
	desc: "Nekonime image",
	async exec({ sock, msg }) {
		try {
			const { url } = await fetchJson("https://nekos.life/api/v2/img/neko");
			await sock.sendMessage(msg.from, { image: { url }, caption: "Your nekonime here." }, { quoted: msg });
		} catch (e) {
			await sock.sendMessage(msg.from, { text: `Something bad happend\n${e.message}` }, { quoted: msg });
		}
	},
};
