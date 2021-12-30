const djs = require('@discordjs/collection');
const lang = require('../other/text.json');

module.exports = {
    name: 'promote',
    category: 'group',
    desc: 'Promote someone to be admin.',
    async exec(msg, sock) {
        const { mentionedJid, quoted, from, sender, isGroup, body } = msg
        try {
            const { prefix } = djs
            const command = body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();

            const meta = isGroup ? await sock.groupMetadata(from) : ''
            const admin = isGroup ? getAdmin(meta.participants) : ''
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
            if (!cekAdmin(sender)) return await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.promote.noPerms}\n\nEN:\n${lang.eng.group.promote.noPerms}` }, { quoted: msg });
            if (!cekAdmin(myID)) return await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.promote.botNoPerms}\n\nEN:\n${lang.eng.group.promote.botNoPerms}` }, { quoted: msg });

            if (quoted) {
                const mention = quoted.participant
                if (!checkInGroup(mention)) return await sock.sendMessage(from, { text: "Member no longer in group" }, { quoted: msg });
                if (cekAdmin(mention)) return await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.promote.fail}\n\nEN:\n${lang.eng.group.promote.fail}` }, { quoted: msg });
                // promote start
                await sock.groupParticipantsUpdate(from, [mention], "promote");
                await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.promote.success}\n\nEN:\n${lang.eng.group.promote.success}` }, { quoted: msg });
            } else if (mentionedJid) {
                const mention = mentionedJid[0]
                if (!checkInGroup(mention)) return await sock.sendMessage(from, { text: "Member no longer in group" }, { quoted: msg });
                if (cekAdmin(mention)) return await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.promote.fail}\n\nEN:\n${lang.eng.group.promote.fail}` }, { quoted: msg });
                // promote start
                await sock.groupParticipantsUpdate(from, [mention], "promote");
                await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.promote.success}\n\nEN:\n${lang.eng.group.promote.success}` }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: `How to: *${prefix + command} @mentionMember*\nor you can reply someone message with *${prefix + command}*` }, { quoted: msg });
            }
        } catch (e) {
            await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.promote.fail}\n\nEN:\n${lang.eng.group.promote.fail}` }, { quoted: msg });
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