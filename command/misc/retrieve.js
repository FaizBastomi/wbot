const { proto, generateWAMessageFromContent } = require("@adiwajshing/baileys");

module.exports = {
	name: "retrieve",
	limit: true,
	consume: 4,
	alias: ["rvo"],
	category: "misc",
	desc: "Retrieve viewOnceMessage.",
	async exec({ sock, msg }) {
		const { quoted, from } = msg;
		if (quoted) {
			if (quoted.type === "view_once") {
				const mtype = Object.keys(quoted.message)[0];
				delete quoted.message[mtype].viewOnce;
				const msgs = proto.Message.fromObject({
					...quoted.message,
				});
				const prep = generateWAMessageFromContent(from, msgs, { quoted: msg });
				await sock.relayMessage(from, prep.message, { messageId: prep.key.id });
			} else {
				await msg.reply("please, reply to viewOnceMessage");
			}
		} else {
			await msg.reply("please, reply to viewOnceMessage");
		}
	},
};
