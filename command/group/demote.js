const djs = require('@discordjs/collection');
const lang = require('../other/text.json');

module.exports = {
    name: 'demote',
    category: 'group',
    desc: 'Demote someone from admin.',
    async exec(msg, sock) {
        const { mentionedJid, quoted, from, sender, isGroup, body } = msg
        try {
            const { prefix } = djs
            const command = body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();

            const meta = isGroup ? await sock.groupMetadata(from) : ''
            const groupMem = isGroup ? meta.participants : ''
            const admin = isGroup ? getAdmin(groupMem) : ''
            const owner = meta.owner
            const myID = sock.user.id.split(":")[0] + "@s.whatsapp.net"
            const cekAdmin = (m) => admin.includes(m)
            const checkInGroup = (m) => {
                let members = []
                for (let ids of meta.participants) {
                    members.push(ids.id)
                }
                return members.includes(m)
            }

            if (!isGroup) return await sock.sendMessage(from, { text: "Only can be executed in group." });
            if (!cekAdmin(sender)) return await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.demote.noPerms}\n\nEN:\n${lang.eng.group.demote.noPerms}` }, { quoted: msg });
            if (!cekAdmin(myID)) return await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.demote.botNoPerms}\n\nEN:\n${lang.eng.group.demote.botNoPerms}` }, { quoted: msg });

            if (quoted) {
                const mention = quoted.participant
                if (!checkInGroup(mention)) return await sock.sendMessage(from, { text: "Member no longer in group" }, { quoted: msg });
                if (!cekAdmin(mention)) return await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.demote.fail}\n\nEN:\n${lang.eng.group.demote.fail}` }, { quoted: msg });
                if (mention === owner) return await sock.sendMessage(from, { text: "Cannot demote group creator" }, { quoted: msg });
                // demote start
                await sock.groupParticipantsUpdate(from, [mention], "demote");
                await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.demote.success}\n\nEN:\n${lang.eng.group.demote.success}` }, { quoted: msg });
            } else if (mentionedJid) {
                const mention = mentionedJid[0]
                if (!checkInGroup(mention)) return await sock.sendMessage(from, { text: "Member no longer in group" }, { quoted: msg });
                if (!cekAdmin(mention)) return await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.demote.fail}\n\nEN:\n${lang.eng.group.demote.fail}` }, { quoted: msg });
                if (mention === owner) return await sock.sendMessage(from, { text: "Cannot demote group creator" }, { quoted: msg });
                // demote start
                await sock.groupParticipantsUpdate(from, [mention], "demote");
                await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.demote.success}\n\nEN:\n${lang.eng.group.demote.success}` }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: `How to: *${prefix + command} @mentionMember*\nor you can reply someone message with *${prefix + command}*` }, { quoted: msg });
            }
        } catch (e) {
            await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.demote.fail}\n\nEN:\n${lang.eng.group.demote.fail}` }, { quoted: msg });
        }
    }
}

function getAdmin(participants) {
    let admins = new Array()
    for (let ids of participants) {
        !ids.admin ? '' : admins.push(ids.id)
    }
    return admins
}