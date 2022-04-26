const { WA_DEFAULT_EPHEMERAL, jidNormalizedUser } = require("@adiwajshing/baileys");
const { checkData, modifyData } = require("../../event/database/group_setting");
const lang = require("../other/text.json");
const Jimp = require("jimp");

module.exports = {
	name: "gcset",
	category: "group",
	desc: "Change your group setting.",
	use: "<group_setting> <on|off|admin|everyone>",
	alias: ["gcst"],
	async exec({ sock, msg, args }) {
		const { from, sender, isGroup, quoted } = msg;
		const meta = isGroup ? await sock.groupMetadata(from) : "";
		const members = isGroup ? meta.participants : "";
		const admins = isGroup ? getAdmins(members) : "";
		const myID = sock.user.id.split(":")[0] + "@s.whatsapp.net";
		const cekAdmin = (i) => admins.includes(i);

		if (!isGroup) return await msg.reply(`Only can be executed in group.`);
		if (args.length < 1)
			return await msg.reply(
				"Here all available group setting, ephemeral | edit_group | send_message | invite | pp"
			);
		if (!cekAdmin(sender))
			return await msg.reply(`IND:\n${lang.indo.group.gcset.noPerms}\n\nEN:\n${lang.eng.group.gcset.noPerms}`);
		if (!cekAdmin(myID))
			return await msg.reply(
				`IND:\n${lang.indo.group.gcset.botNoPerms}\n\nEN:\n${lang.eng.group.gcset.botNoPerms}`
			);

		let setting = args[0].toLowerCase();
		switch (setting) {
			case "ephemeral": {
				if (args.length < 2) return await msg.reply("Some argument appear to be missing");
				let condition = args[1].toLowerCase();
				switch (condition) {
					case "on":
					case "aktif":
						await sock.groupToggleEphemeral(from, WA_DEFAULT_EPHEMERAL);
						break;
					case "off":
					case "mati":
						await sock.groupToggleEphemeral(from, 0);
						break;
					default:
						await msg.reply("Select setting condition, on/off");
				}
				break;
			}
			case "edit_group": {
				if (args.length < 2) return await msg.reply("Some argument appear to be missing");
				let condition = args[1].toLowerCase();
				switch (condition) {
					case "admin":
						await sock.groupSettingUpdate(from, "locked");
						break;
					case "everyone":
						await sock.groupSettingUpdate(from, "unlocked");
						break;
					default:
						await msg.reply("Select who can edit group info, admin/everyone");
				}
				break;
			}
			case "send_message": {
				if (args.length < 2) return await msg.reply("Some argument appear to be missing");
				let condition = args[1].toLowerCase();
				switch (condition) {
					case "admin":
						await sock.groupSettingUpdate(from, "announcement");
						break;
					case "everyone":
						await sock.groupSettingUpdate(from, "not_announcement");
						break;
					default:
						await msg.reply("Select who can send message to this group, admin/everyone");
				}
				break;
			}
			case "invite": {
				if (args.length < 2) return await msg.reply("Some argument appear to be missing");
				let condition = args[1].toLowerCase();
				let currentData;
				switch (condition) {
					case "allow":
					case "izinkan":
						currentData = checkData(from.split("@")[0], "on/link");
						if (currentData === "active") {
							await msg.reply("```Already active/Sudah Aktif```");
						} else if (currentData === "no_file" || currentData === "inactive") {
							modifyData(from.split("@")[0], "on/link");
							await msg.reply("```Activated/Telah diaktifkan```");
						}
						break;
					case "disallow":
					case "dilarang":
						currentData = checkData(from.split("@")[0], "on/link");
						if (currentData === "inactive") {
							await msg.reply("```Never active/Tidak pernah diaktifkan```");
						} else if (currentData === "active") {
							modifyData(from.split("@")[0], "on/link");
							await msg.reply("```Success deactivated/Berhasil di nonaktifkan```");
						} else if (currentData === "no_file") {
							await msg.reply("```Please actived this feature first/Harap aktifkan fitur ini dahulu```");
						}
						break;
				}
				break;
			}
			case "pp": {
				if (
					msg?.message?.imageMessage ||
					quoted?.message?.imageMessage ||
					["image/jpeg", "image/png"].includes(msg?.message?.documentMessage?.mimetype) ||
					["image/jpeg", "image/png"].includes(quoted?.message?.documentMessage?.mimetype)
				) {
					let imgBuffer = quoted ? await quoted.download() : await msg.download();
					await patchProfilePicture(from, sock, imgBuffer);
					imgBuffer = null;
				} else {
					await msg.reply("Media type not acceptable");
				}
				break;
			}
			default:
				await msg.reply(
					"Here all available group setting, ephemeral | edit_group | send_message | invite | pp"
				);
		}
	},
};

function getAdmins(a) {
	let admins = [];
	for (let ids of a) {
		!ids.admin ? "" : admins.push(ids.id);
	}
	return admins;
}

/**
 * Change Group Profile Picture
 * @param {string} id current group chat
 * @param sock any connection
 * @param {Buffer} buffer image
 * @returns
 */
const patchProfilePicture = async (id, sock, buffer) => {
	const jimp = await Jimp.read(buffer);
	const applyPicture = async (jid, imgBuffer) => {
		return await sock.query({
			tag: "iq",
			attrs: {
				to: jidNormalizedUser(jid),
				type: "set",
				xmlns: "w:profile:picture",
			},
			content: [
				{
					tag: "picture",
					attrs: { type: "image" },
					content: imgBuffer,
				},
			],
		});
	};
	//
	let height = jimp.getHeight(),
		width = jimp.getWidth(),
		img = null;
	//
	if (width === height) {
		let min = Math.min(width, height);
		let crop = jimp.crop(0, 0, min, min);
		img = await crop.resize(640, 640, Jimp.RESIZE_BILINEAR).quality(100).getBufferAsync(Jimp.MIME_JPEG);
		return await applyPicture(id, img);
	} else if (width > height) (width = 800), (height = height / (jimp.getWidth() / width));
	else if (width < height) (height = 700), (width = width / (jimp.getHeight() / height));
	img = await jimp.resize(width, height).quality(100).getBufferAsync(Jimp.MIME_JPEG);
	await applyPicture(id, img);
	img = null;
};
