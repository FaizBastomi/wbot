const { getBinaryNodeChild } = require("@adiwajshing/baileys");

module.exports = {
	name: "join",
	limit: true,
	consume: 7,
	category: "misc",
	desc: "Join to group using invite url.",
	async exec({ sock, msg, args }) {
		// search for invite url
		const rex1 = /chat.whatsapp.com\/([\w\d]*)/g;
		const queryInvite = async (code) => {
			const results = await sock.query({
				tag: "iq",
				attrs: {
					type: "get",
					xmlns: "w:g2",
					to: "@g.us",
				},
				content: [{ tag: "invite", attrs: { code } }],
			});
			const group = getBinaryNodeChild(results, "group");
			return group.attrs;
		};

		let code = args.join(" ").match(rex1);
		if (code === null) return await msg.reply("No invite url detected.");
		code = code[0].replace("chat.whatsapp.com/", "");
		// check invite code
		const check = await queryInvite(code).catch(async () => {
			await msg.reply("Invalid invite url.");
		});
		//
		if (check.size >= 257) return await msg.reply("Group Full");
		if (check.size < 80)
			return await msg.reply("The minimum requirement for group members must be more than 80 people.");
		// Trying to join group with given invite code
		await sock.groupAcceptInvite(code).catch(async () => {
			await msg.reply("Looks like the group already full or became invalid when I'm trying to join :/");
		});
		await msg.reply("Success join into your group.");
	},
};
