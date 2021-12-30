function serialize(chat, sock) {

    let msg = JSON.parse(JSON.stringify(chat)).messages[0];

    if (!msg?.message?.protocolMessage && !msg?.message?.senderKeyDistributionMessage) {
        const content = msg.message;

        try {
            const tipe = Object.keys(content)[0] === "messageContextInfo" ? Object.keys(content)[1] : Object.keys(content)[0];
            msg.type = tipe;
        } catch {
            msg.type = null;
        }

        if (msg.type === "viewOnceMessage") {
            msg.message = msg.message.viewOnceMessage.message;
            try {
                const tipe = Object.keys(msg.message)[0];
                msg.type = tipe;
            } catch {
                msg.type = null;
            }
        }

        if (msg.type === "ephemeralMessage") {
            msg.message = msg.message.ephemeralMessage.message;
            const tipe = Object.keys(content)[0] === "messageContextInfo" ? Object.keys(content)[1] : Object.keys(content)[0];

            if (tipe === "viewOnceMessage") {
                msg.message = msg.message.viewOnceMessage.message;
                try {
                    const tipe = Object.keys(msg.message)[0];
                    msg.type = tipe;
                } catch {
                    msg.type = null;
                }
            }

            try {
                const tipe = Object.keys(msg.message)[0];
                msg.type = tipe;
            } catch {
                msg.type = null;
            }
            msg.isEphemeral = true;
        } else {
            msg.isEphemeral = false;
        }

        msg.isGroup = msg.key.remoteJid.endsWith('@g.us');
        msg.from = msg.key.remoteJid;

        try {
            const q = msg.message[msg.type].contextInfo;
            if (q.quotedMessage["ephemeralMessage"]) {
                const tipe = Object.keys(q.quotedMessage["ephemeralMessage"].message)[0];

                if (tipe === "viewOnceMessage") {
                    msg.quoted = {
                        type: "view_once",
                        stanzaId: q.stanzaId,
                        participant: q.participant.includes(":") ? q.participant.split(":")[0] + "@s.whatsapp.net" : q.participant,
                        message: q.quotedMessage.ephemeralMessage.message.viewOnceMessage.message
                    }
                } else {
                    msg.quoted = {
                        type: "ephemeral",
                        stanzaId: q.stanzaId,
                        participant: q.participant.includes(":") ? q.participant.split(":")[0] + "@s.whatsapp.net" : q.participant,
                        message: q.quotedMessage.ephemeralMessage.message
                    }
                }
            } else if (q.quotedMessage['viewOnceMessage']) {
                msg.quoted = {
                    type: "view_once",
                    stanzaId: q.stanzaId,
                    participant: q.participant.includes(":") ? q.participant.split(":")[0] + "@s.whatsapp.net" : q.participant,
                    message: q.quotedMessage.viewOnceMessage.message
                }
            } else {
                msg.quoted = {
                    type: "normal",
                    stanzaId: q.stanzaId,
                    participant: q.participant.includes(":") ? q.participant.split(":")[0] + "@s.whatsapp.net" : q.participant,
                    message: q.quotedMessage
                }
            }
        } catch {
            msg.quoted = null;
        }

        try {
            const mentions = msg.message[msg.type].contextInfo.mentionedJid;
            msg.mentions = mentions;
        } catch {
            msg.mentions = null;
        }

        if (msg.isGroup) {
            msg.sender = msg.key.participant.includes(":")
                ? msg.key.participant.split(":")[0] + "@s.whatsapp.net" : msg.key.participant;
        } else {
            msg.sender = msg.key.remoteJid.includes(":")
                ? msg.key.remoteJid.split(":")[0] + "@s.whatsapp.net" : msg.key.remoteJid;
        }

        if (msg.key.fromMe) {
            msg.sender = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        }

        const txt =
            msg.type === "conversation" && msg.message[msg.type]
                ? msg.message[msg.type] : msg.type === "imageMessage" && msg.message[msg.type].caption
                ? msg.message[msg.type].caption : msg.type === "videoMessage" && msg.message[msg.type].caption
                ? msg.message[msg.type].caption : msg.type === "extendedTextMessage" && msg.message[msg.type].text
                ? msg.message[msg.type].text : msg.type === "buttonsResponseMessage" && msg.message[msg.type].selectedButtonId.includes("SMH")
                ? msg.message[msg.type].selectedButtonId : msg.type === "listResponseMessage" && msg.message[msg.type].singleSelectReply.selectedRowId
                ? msg.message[msg.type].singleSelectReply.selectedRowId : msg.type === "templateButtonReplyMessage" && msg.message[msg.type].selectedId
                ? msg.message[msg.type].selectedId : '';

        msg.body = txt;
        return msg;
    } else {
        msg = { ...msg, type: Object.keys(msg.message)[0] }
        return msg;
    }
}

module.exports = {
    serialize
}