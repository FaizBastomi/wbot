const { checkData, getData, deleteData } = require("./database/group_setting");

/**
 * @param {import("@adiwajshing/baileys/src").AnyWASocket} sock
 */
module.exports = joinhandler = async (data, sock) => {
	// For Bot
	const gM = data.action === "add" ? await sock.groupMetadata(data.id) : "";
	const myID =
		sock.type === "legacy"
			? sock.state.legacy.user.id
			: sock.user.id.split(":")[0] + "@s.whatsapp.net" || sock.user.id;
	if (data.action === "add" && data.participants.includes(myID)) {
		if (gM.participants.length < 80) {
			await sock
				.sendMessage(data.id, {
					text: "Sorry, but this group member is not more than 80 members, I leave soon.",
				})
				.then(async (m) => {
					await sock.groupLeave(data.id);
					setTimeout(async () => {
						await sock.chatModify({ delete: true }, data.id);
					}, 5000);
				});
		} else {
			await sock.sendMessage(data.id, { text: "Thanks for letting me join your group :D" });
		}
	} else if (data.action === "remove" && data.participants.includes(myID)) {
		let info = checkData(data.id.split("@")[0]);
		if (info !== "no_file") {
			deleteData(data.id.split("@")[0]);
		}
	}

	// For User
	if (data.action === "add" && !data.participants.includes(myID)) {
		let id = data.id.split("@")[0];
		let info = checkData(id);
		let replace = {
			"%": "%",
			member:
				data.participants.length > 0
					? data.participants
							.map((v) => {
								return "@" + v.split("@")[0];
							})
							.join(" ")
					: "@" + data.participants[0].split("@")[0],
			user:
				data.participants.length > 0
					? data.participants
							.map((v) => {
								return "@" + v.split("@")[0];
							})
							.join(" ")
					: "@" + data.participants[0].split("@")[0],
			group: gM?.subject,
			desc: gM?.desc?.toString(),
		};
		if (info !== "no_file") {
			const dataConf = getData(id);
			let text = dataConf["join"]["msg"].replace(
				new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, "g"),
				(_, name) => "" + replace[name]
			);
			if (dataConf["join"]["active"]) {
				await sock.sendMessage(data.id, { text, mentions: data.participants });
			}
		}
	} else if (data.action === "remove" && !data.participants.includes(myID)) {
		let id = data.id.split("@")[0];
		let info = checkData(id);
		let replace = {
			"%": "%",
			member:
				data.participants.length > 0
					? data.participants
							.map((v) => {
								return "@" + v.split("@")[0];
							})
							.join(" ")
					: "@" + data.participants[0].split("@")[0],
			user:
				data.participants.length > 0
					? data.participants
							.map((v) => {
								return "@" + v.split("@")[0];
							})
							.join(" ")
					: "@" + data.participants[0].split("@")[0],
			group: gM?.subject,
			desc: gM?.desc?.toString(),
		};
		if (info !== "no_file") {
			const dataConf = getData(id);
			let text = dataConf["left"]["msg"].replace(
				new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, "g"),
				(_, name) => "" + replace[name]
			);
			if (dataConf["left"]["active"]) {
				await sock.sendMessage(data.id, { text, mentions: data.participants });
			}
		}
	}
};
