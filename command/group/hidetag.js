const lang = require('../other/text.json')

module.exports = {
    name: 'hidetag',
    alias: ['htag'],
    desc: 'Tag all member',
    category: 'group',
    async exec(msg, sock, args) {
        const { from, sender, isGroup } = msg
        const meta = isGroup ? await sock.groupMetadata(from) : ''
        const groupMem = isGroup ? meta.participants : ''
        const admin = isGroup ? getAdmin(groupMem) : ''
        const cekAdmin = (m) => admin.includes(m)

        if (!isGroup) return await sock.sendMessage(from, { text: "Only can be executed in group." });
        if (!cekAdmin(sender)) return await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.tagall.noPerms}\n\nEN:\n${lang.eng.group.tagall.noPerms}` }, { quoted: msg });
        let mems_id = []
        let text = args.length > 0 ? args.join(' ') : ''
        for (let i of groupMem) {
            mems_id.push(i.id)
        }
        await sock.sendMessage(from, { text, mentions: mems_id }, { quoted: msg });
    }
}

function getAdmin(a) {
    let admins = []
    for (let ids of a) {
        !ids.admin ? '' : admins.push(ids.id)
    }
    return admins
}
