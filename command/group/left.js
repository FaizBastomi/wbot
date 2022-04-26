const { checkData, modifyData } = require("../../event/database/group_setting");
const lang = require("../other/text.json");

module.exports = {
	name: "left",
	desc: "Setting left message in your group",
	category: "group",
	use:
		"_options_ _value_\n\n" +
		"*Options*\n~ on - turned on left message\n" +
		"~ off - turned off left message\n" +
		"~ message - set custom message\n\n" +
		"Ex:\n!left on\n!left off\n\n" +
		"For custom message:\n%member - tag new member\n%group - group name\n%desc - group description\n\n" +
		"Ex: !left message %member leaving us",
	async exec({ sock, msg, args }) {
		const { from, isGroup, sender } = msg;
		const gM = isGroup ? await sock.groupMetadata(from) : "";
		const admin = isGroup ? getAdmin(gM.participants) : "";
		const cekAdmin = (m) => admin.includes(m);

		if (!isGroup) return await msg.reply("Only can be executed in group.");
		if (!cekAdmin(sender))
			return await msg.reply(
				`IND:\n${lang.indo.group.promote.noPerms}\n\nEN:\n${lang.eng.group.promote.noPerms}`
			);
		if (!args.length > 0) return await msg.reply("Please check #help left");

		// Command
		let opt = args[0],
			filename = from.split("@")[0],
			dataOn;
		switch (opt) {
			case "on":
				dataOn = checkData(filename, "on/left");
				if (dataOn === "active") {
					return await msg.reply("```Already active/Sudah aktif```");
				} else if (dataOn === "no_file" || dataOn === "inactive") {
					modifyData(filename, "on/left");
					return await msg.reply("```Activated/Telah diaktifkan```");
				}
				break;
			case "off":
				dataOn = checkData(filename, "on/left");
				if (dataOn === "inactive") {
					return await msg.reply("```Never active/Tidak pernah aktif```");
				} else if (dataOn === "no_file") {
					return await msg.reply("```Please actived this feature first/Harap aktifkan fitur ini dahulu```");
				} else if (dataOn === "active") {
					modifyData(filename, "on/left");
					return await msg.reply("```Success deactivated/Berhasil di nonaktifkan```");
				}
				break;
			case "message":
				modifyData(filename, "left", args.slice(1).join(" "));
				await msg.reply("```Custom message edited successfully/Pesan custom berhasil di edit```");
				break;
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
