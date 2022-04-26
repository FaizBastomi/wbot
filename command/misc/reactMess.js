const EmojiRegex = require("../../lib/emojiRegex");

module.exports = {
	name: "react",
	limit: true,
	consume: 1,
	category: "misc",
	desc: "Reaction message",
	use: "<emoji>",
	async exec({ msg, sock, args }) {
		if (!EmojiRegex.test(args.join(" "))) return msg.reply("Invalid emoji");
		const reactionMessage = {
			react: {
				text: `${args.join(" ")}`,
				key: msg.quoted ? msg.quoted.key : msg.key,
			},
		};
		await sock.sendMessage(msg.from, reactionMessage);
		await msg.reply("Done.");
	},
};
