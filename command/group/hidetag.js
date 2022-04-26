const lang = require("../other/text.json");

module.exports = {
	name: "hidetag",
	limit: true,
	consume: 3,
	premium: true,
	premiumType: ["drakath", "nulgath", "artix"],
	alias: ["htag"],
	desc: "Tag all member",
	category: "group",
	async exec({ sock, msg, args }) {
		const { from, sender, isGroup, quoted } = msg;
		const meta = isGroup ? await sock.groupMetadata(from) : "";
		const groupMem = isGroup ? meta.participants : "";
		const admin = isGroup ? getAdmin(groupMem) : "";
		const cekAdmin = (m) => admin.includes(m);

		if (!isGroup) return await msg.reply("Only can be executed in group.");
		if (!cekAdmin(sender))
			return await msg.reply(`IND:\n${lang.indo.group.tagall.noPerms}\n\nEN:\n${lang.eng.group.tagall.noPerms}`);
		let mems_id = [];
		let text = args.length > 0 ? args.join(" ") : "";
		for (let i of groupMem) {
			mems_id.push(i.id);
		}

		if (quoted) {
			await sock.sendMessage(from, { text, mentions: mems_id }, { quoted });
		} else {
			await sock.sendMessage(from, { text, mentions: mems_id }, { quoted: msg });
		}
	},
};

function getAdmin(a) {
	let admins = [];
	for (let ids of a) {
		!ids.admin ? "" : admins.push(ids.id);
	}
	return admins;
}
