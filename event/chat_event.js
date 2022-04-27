const { getBinaryNodeChild } = require("@adiwajshing/baileys");
const { serialize } = require("../lib/helper");
const { checkData } = require("./database/group_setting");
const Premium = require("./database/Premium");
const djs = require("../lib/Collection");
const { color } = require("../utils");
const { owner } = require("../config.json");

const cooldown = new djs.Collection();
const prefix = "!";
const user = new Premium();
const multi_pref = new RegExp("^[" + "!#$%&?/;:,.<>~-+=".replace(/[|\\{}()[\]^$+*?.\-\^]/g, "\\$&") + "]");

function printSpam(isGc, sender, gcName) {
	if (isGc) {
		return console.log(color("[SPAM]", "red"), color(sender.split("@")[0], "lime"), "in", color(gcName, "lime"));
	}
	if (!isGc) {
		return console.log(color("[SPAM]", "red"), color(sender.split("@")[0], "lime"));
	}
}

function printLog(isCmd, sender, gcName, isGc) {
	if (isCmd && isGc) {
		return console.log(color("[EXEC]", "aqua"), color(sender.split("@")[0], "lime"), "in", color(gcName, "lime"));
	}
	if (isCmd && !isGc) {
		return console.log(color("[EXEC]", "aqua"), color(sender.split("@")[0], "lime"));
	}
}

/**
 * This function will check every received message which includes the whatsapp group invite link
 * and kick the sender
 * @param sock current connection socket
 * @param {String} groupId group id
 * @param {String} text message
 * @param {String} participant sender of message
 * @param gcMeta group Metadata
 */
const checkLinkAndKick = async (sock, groupId = "", text = "", participant = "", gcMeta) => {
	let currentData = checkData(groupId.split("@")[0], "on/link");
	if (currentData === "inactive" || currentData === "no_file") {
		return;
	} else if (text.includes("chat.whatsapp.com") && currentData === "active") {
		// Extract the original invitation code for further checking
		let code = text.match(/chat\.whatsapp\.com\/([\w\d]*)/g)?.[0]?.replace("chat.whatsapp.com/", "");
		// Filter to check bot and sender is admin or not
		let isBotAdmin = gcMeta?.participants?.filter((ids) => ids.id === sock.user.id.replace(/:([0-9]+)/, ""))[0]?.admin;
		let isSenderAdmin = gcMeta?.participants?.filter((ids) => ids.id === participant)[0]?.admin;
		// Don't execute if bot is not admin or if sender is admin
		if (!isBotAdmin || isSenderAdmin) {
			return console.log(color("[SYS]", "yellow"), `sender (${participant}) is an admin or bot is not an admin`);
		}
		// Request to WhatsApp server for current group invite code
		let groupCode = await sock.groupInviteCode(groupId);
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

		// If the invite code is not found or is the same as the current group invite code, ignore it
		if (!code || code === "" || code === groupCode) {
			return console.log(
				color("[SYS]", "yellow"),
				`This (${code}) invite code is invalid or current group (${color(groupId, "green")}) invite code.`
			);
		} else {
			let status;
			/**
			 * Attempting to request detailed information about the received invitation code,
			 * if that fails just ignore it
			 */
			try {
				status = await queryInvite(code);
			} catch {
				return console.log(color("[SYS]", "yellow"), `This (${code}) invite code is invalid.`);
			}
			if (status.id) {
				await sock.groupParticipantsUpdate(groupId, [participant], "remove");
				return "done.";
			} else {
				return;
			}
		}
	}
};

module.exports = chatHandler = async (m, sock) => {
	try {
		if (m.type !== "notify") return;
		let msg = serialize(JSON.parse(JSON.stringify(m.messages[0])), sock);
		if (!msg.message) return;
		if (msg.key && msg.key.remoteJid === "status@broadcast") return;
		if (
			msg.type === "protocolMessage" ||
			msg.type === "senderKeyDistributionMessage" ||
			!msg.type ||
			msg.type === ""
		)
			return;

		let { body } = msg;
		const { isGroup, sender, from } = msg;
		const gcMeta = isGroup ? await sock.groupMetadata(from) : "";
		const gcName = isGroup ? gcMeta.subject : "";
		const isOwner = owner.includes(sender) || msg.isSelf;

		// no group invite
		checkLinkAndKick(sock, from, body, sender, gcMeta);
		let temp_pref = multi_pref.test(body) ? body.split("").shift() : "!";
		if (body === "prefix" || body === "cekprefix") {
			msg.reply(`My prefix ${prefix}`);
		}
		if (body) {
			body = body.startsWith(temp_pref) ? body : "";
		} else {
			body = "";
		}

		const arg = body.substring(body.indexOf(" ") + 1);
		const args = body.trim().split(/ +/).slice(1);
		const isCmd = body.startsWith(temp_pref);

		// Log
		printLog(isCmd, sender, gcName, isGroup);

		const cmdName = body.slice(temp_pref.length).trim().split(/ +/).shift().toLowerCase();
		const cmd = djs.commands.get(cmdName) || djs.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
		if (!cmd) return;

		// auto register
		if (!user.getUser(sender)) user.addUser(sender);
		// check if command for premium user
		const userData = user.checkPremium(sender);
		if (cmd.premium && !isOwner) {
			if (!userData.status) return await msg.reply("Only Premium member!");
			if (!cmd.premiumType.includes(userData.type))
				return await msg.reply(`This command only for _'${cmd.premiumType.join(" / ")}'_`);
		}
		if (cmd.owner && !isOwner) {
			return await msg.reply("You are not my owner");
		}

		if (!cooldown.has(from)) {
			cooldown.set(from, new djs.Collection());
		}
		const now = Date.now();
		const timestamps = cooldown.get(from);
		const cdAmount = (cmd.cooldown || 5) * 1000;
		if (timestamps.has(from)) {
			const expiration = timestamps.get(from) + cdAmount;

			if (now < expiration) {
				if (isGroup) {
					let timeLeft = (expiration - now) / 1000;
					printSpam(isGroup, sender, gcName);
					return await sock.sendMessage(
						from,
						{ text: `This group is on cooldown, please wait another _${timeLeft.toFixed(1)} second(s)_` },
						{ quoted: msg }
					);
				} else if (!isGroup) {
					let timeLeft = (expiration - now) / 1000;
					printSpam(isGroup, sender);
					return await sock.sendMessage(
						from,
						{ text: `You are on cooldown, please wait another _${timeLeft.toFixed(1)} second(s)_` },
						{ quoted: msg }
					);
				}
			}
		}
		timestamps.set(from, now);
		setTimeout(() => timestamps.delete(from), cdAmount);

		try {
			// check if command has limit consume
			if (cmd.limit && !isOwner && userData.type !== "artix" && !userData.type) {
				let data = user.getUser(sender);
				let consume = cmd.consume || 1;
				if (data.limit < consume) return await msg.reply("Your limit not enough");
				data["limit"] = data.limit - consume;
				user.editUser(sender, data);
				await msg.reply(`Limit used for this command > ${consume}`);
			}
			// execute
			cmd.exec({ sock, msg, args, arg, isOwner });
		} catch (e) {
			console.error(e);
		}
	} catch (e) {
		console.log(
			color("[Err]", "red"),
			e.stack + "\nerror while handling chat event, might some message not answered"
		);
	}
};
