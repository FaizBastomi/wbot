const { proto } = require("@adiwajshing/baileys-md");
const { downloadMedia } = require("../utils");

/**
 * parse message for easy use
 * @param {proto.IWebMessageInfo} msg 
 * @param {import("@adiwajshing/baileys-md/src").AnyWASocket} sock 
 * @returns 
 */
const serialize = (msg, sock) => {
    if (msg?.message?.protocolMessage || msg?.message?.senderKeyDistributionMessage) {
        return { ...msg, type: Object.keys(msg.message)[0] };
    }
    else {
        if (msg.key) {
            msg.id = msg.key.id;
            msg.isSelf = msg.key.fromMe;
            msg.from = msg.key.remoteJid;
            msg.sender = msg.isSelf ? (sock.user.id.split(":")[0] + "@s.whatsapp.net" || sock.user.id) : (msg.key.participant || msg.key.remoteJid);
            msg.isGroup = msg.from.endsWith("@g.us");
        }
        if (msg.message) {
            msg.type = Object.keys(msg.message)[0] === "messageContextInfo" ? Object.keys(msg.message)[1] : Object.keys(msg.message)[0];
            msg.body = msg.message.conversation || msg.message[msg.type].text || msg.message[msg.type].caption || (msg.type === "listResponseMessage") && msg.message[msg.type].singleSelectReply.selectedRowId
                || (msg.type === "buttonsResponseMessage" && msg.message[msg.type].selectedButtonId.includes("SMH")) && msg.message[msg.type].selectedButtonId || (msg.type === "templateButtonReplyMessage") && msg.message[msg.type].selectedId || '';
            if (msg.type === "ephemeralMessage") {
                msg.message = msg.message[msg.type].message;
                serialize(msg, sock);
            }
            if (msg.type === "viewOnceMessage") {
                msg.message = msg.message[msg.type].message;
                serialize(msg, sock);
            }
            msg.mentions = msg.message[msg.type].contextInfo ? msg.message[msg.type].contextInfo.mentionedJid : null;
            try {
                msg.quoted = msg.message[msg.type].contextInfo ? msg.message[msg.type].contextInfo : null;
                if (msg.quoted) {
                    let type = Object.keys(msg.quoted.quotedMessage)[0];
                    if (type === "ephemeralMessage") {
                        const tipe = Object.keys(msg.quoted.quotedMessage[type].message)[0];
                        msg.quoted = { ...msg.quoted, message: msg.quoted.quotedMessage[type].message, type: "ephemeral" };
                        if (tipe === "viewOnceMessage") {
                            msg.quoted = { ...msg.quoted, message: msg.quoted.quotedMessage[type].message[tipe].message, type: "view_once" };
                        }
                    }
                    if (type === "viewOnceMessage") {
                        msg.quoted = { ...msg.quoted, message: msg.quoted.quotedMessage[type].message, type: "view_once" };
                    }
                    msg.quoted.type = msg.quoted.type || 'normal';
                    msg.quoted.message = { ...(msg.quoted.message || msg.quoted.quotedMessage) };
                    msg.quoted.isSelf = msg.quoted.participant === (sock.user && sock.user.id.split(":")[0] + "@s.whatsapp.net");
                    msg.quoted.key = { remoteJid: msg.from, fromMe: msg.quoted.isSelf, id: msg.quoted.stanzaId };
                    msg.quoted.delete = () => sock.sendMessage(msg.from, { delete: msg.quoted.key });
                    msg.quoted.download = (pathFile = undefined) => downloadMedia(msg.quoted.message, pathFile);
                    delete msg.quoted.quotedMessage;
                }
            } catch { msg.quoted = null; }
            msg.reply = (text) => sock.sendMessage(msg.from, { text }, { quoted: msg });
            msg.download = (pathFile = undefined) => downloadMedia(msg.message, pathFile);
        }
        return msg;
    }
}

module.exports = { serialize };
