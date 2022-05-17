const { getBinaryNodeChild } = require("@adiwajshing/baileys");

module.exports = {
	name: "inspect",
	alias: ["check"],
	category: "misc",
	use: "<link>",
	async exec({ sock, msg, args }) {
		if (!args.length > 0) return await msg.reply("No invite url.");
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
			return extractGroupInviteMetadata(results);
		};
		let code = args.join(" ").match(rex1);
		if (code === null) return await msg.reply("No invite url detected.");
		code = code[0].replace("chat.whatsapp.com/", "");
		// check invite code
		const check = await queryInvite(code).catch(async () => {
			await msg.reply("Invalid invite url.");
		});
		const text =
			`Subject: ${check.subject}\nGroupId: ${check.id}${
				check.creator ? `\nCreator: ${check.creator}` : ""
			}\nCreate At: ${new Date(check.creation * 1000).toLocaleString()}` +
			`${check.desc ? `\nDesc: ${check.desc}\nDescId: ${check.descId}` : ""}\n\nJSON\n\`\`\`${JSON.stringify(
				check,
				null,
				4
			)}\`\`\``;
		await msg.reply(text);
	},
};

const extractGroupInviteMetadata = (content) => {
	const group = getBinaryNodeChild(content, "group");
	const descChild = getBinaryNodeChild(group, "description");
	let desc, descId;
	if (descChild) {
		desc = getBinaryNodeChild(descChild, "body")?.content?.toString();
		descId = descChild.attrs.id;
	}
	const groupId = group.attrs.id.includes("@") ? group.attrs.id : group.attrs.id + "@g.us";
	const metadata = {
		id: groupId,
		subject: group.attrs?.subject,
		creator: group.attrs?.creator
			? group.attrs?.creator
			: groupId.includes("-")
			? groupId.split("-")[0]
			: group.attrs?.creator,
		creation: group.attrs?.creation,
		desc,
		descId,
	};
	return metadata;
};
