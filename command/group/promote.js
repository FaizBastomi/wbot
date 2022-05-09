const djs = require("../../lib/Collection");
const lang = require("../other/text.json");

module.exports = {
	name: "promote",
	category: "group",
	desc: "Promote someone to be admin.",
	async exec({ sock, msg }) {
		const { mentions, quoted, from, sender, isGroup, body } = msg;
		try {
			const { prefix } = djs;
			const command = body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();

			const meta = isGroup ? await sock.groupMetadata(from) : "";
			const admin = isGroup ? getAdmin(meta.participants) : "";
			const myID = sock.user.id.split(":")[0] + "@s.whatsapp.net";
			const cekAdmin = (m) => admin.includes(m);
			const checkInGroup = (m) => {
				let members = [];
				for (let ids of meta.participants) {
					members.push(ids.id);
				}
				return members.includes(m);
			};

			if (!isGroup) return await msg.reply("Only can be executed in group.");
			if (!cekAdmin(sender))
				return await msg.reply(
					`IND:\n${lang.indo.group.promote.noPerms}\n\nEN:\n${lang.eng.group.promote.noPerms}`
				);
			if (!cekAdmin(myID))
				return await msg.reply(
					`IND:\n${lang.indo.group.promote.botNoPerms}\n\nEN:\n${lang.eng.group.promote.botNoPerms}`
				);

			if (quoted) {
				const mention = quoted.participant;
				if (!checkInGroup(mention)) return await msg.reply("Member no longer in group");
				if (cekAdmin(mention))
					return await msg.reply(
						`IND:\n${lang.indo.group.promote.fail}\n\nEN:\n${lang.eng.group.promote.fail}`
					);
				// promote start
				await sock.groupParticipantsUpdate(from, [mention], "promote");
				await msg.reply(`IND:\n${lang.indo.group.promote.success}\n\nEN:\n${lang.eng.group.promote.success}`);
			} else if (mentions) {
				const mention = mentions[0];
				if (!checkInGroup(mention)) return await msg.reply("Member no longer in group");
				if (cekAdmin(mention))
					return await msg.reply(
						`IND:\n${lang.indo.group.promote.fail}\n\nEN:\n${lang.eng.group.promote.fail}`
					);
				// promote start
				await sock.groupParticipantsUpdate(from, [mention], "promote");
				await msg.reply(`IND:\n${lang.indo.group.promote.success}\n\nEN:\n${lang.eng.group.promote.success}`);
			} else {
				await msg.reply(
					`How to: *${prefix + command} @mentionMember*\nor you can reply someone message with *${
						prefix + command
					}*`
				);
			}
		} catch (e) {
			await msg.reply(`IND:\n${lang.indo.group.promote.fail}\n\nEN:\n${lang.eng.group.promote.fail}`);
		}
	},
};

function getAdmin(participants) {
	let admins = new Array();
	for (let ids of participants) {
		!ids.admin ? "" : admins.push(ids.id);
	}
	return admins;
}
