const { calculatePing } = require("../../utils");

module.exports = {
	name: "ping",
	category: "misc",
	desc: "Bot response in second.",
	async exec({ msg }) {
		await msg.reply(`*_${calculatePing(msg.messageTimestamp, Date.now())} second(s)_*`);
	},
};
