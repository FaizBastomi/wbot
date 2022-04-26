module.exports = {
	name: "del",
	alias: ["delete"],
	category: "misc",
	use: "*reply to my message*",
	async exec({ msg }) {
		if (msg?.quoted?.isSelf) return await msg.quoted.delete();
		else return msg.reply("Please, reply to message sent by bot");
	},
};
