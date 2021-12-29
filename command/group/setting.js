const { WA_DEFAULT_EPHEMERAL } = require('@adiwajshing/baileys-md')
const lang = require('../other/text.json')

module.exports = {
    name: 'gcset',
    category: 'group',
    desc: 'Change your group setting.',
    use: '<group_setting> <on|off|admin|everyone>',
    alias: ['gcst'],
    async exec(msg, sock, args) {
        const { from, sender, isGroup } = msg
        const meta = isGroup ? await sock.groupMetadata(from) : ''
        const members = isGroup ? meta.participants : ''
        const admins = isGroup ? getAdmins(members) : ''
        const myID = sock.user.id.split(":")[0] + "@s.whatsapp.net"
        const cekAdmin = (i) => admins.includes(i)

        if (!isGroup) return await sock.sendMessage(from, { text: `Only can be executed in group.` })
        if (args.length < 1) return await sock.sendMessage(from, { text: 'Here all available group setting, ephemeral | edit_group | send_message' }, { quoted: msg })
        if (!cekAdmin(sender)) return await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.gcset.noPerms}\n\nEN:\n${lang.eng.group.gcset.noPerms}` }, { quoted: msg })
        if (!cekAdmin(myID)) return await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.gcset.botNoPerms}\n\nEN:\n${lang.eng.group.gcset.botNoPerms}` }, { quoted: msg })

        let setting = args[0].toLowerCase()
        switch (setting) {
            case 'ephemeral': {
                if (args.length < 2) return await sock.sendMessage(from, { text: 'Some argument appear to be missing' }, { quoted: msg })
                let condition = args[1].toLowerCase()
                switch (condition) {
                    case 'on': case 'aktif':
                        await sock.groupToggleEphemeral(from, WA_DEFAULT_EPHEMERAL);
                        break;
                    case 'off': case 'mati':
                        await sock.groupToggleEphemeral(from, 0)
                        break;
                    default:
                        await sock.sendMessage(from, { text: 'Select setting condition, on/off' }, { quoted: msg })
                }
                break
            }
            case 'edit_group': {
                if (args.length < 2) return await sock.sendMessage(from, { text: 'Some argument appear to be missing' }, { quoted: msg })
                let condition = args[1].toLowerCase()
                switch (condition) {
                    case 'admin':
                        await sock.groupSettingUpdate(from, "locked")
                        break;
                    case 'everyone':
                        await sock.groupSettingUpdate(from, "unlocked")
                        break;
                    default:
                        await sock.sendMessage(from, { text: 'Select who can edit group info, admin/everyone' }, { quoted: msg })
                }
                break;
            }
            case 'send_message': {
                if (args.length < 2) return await sock.sendMessage(from, { text: 'Some argument appear to be missing' }, { quoted: msg })
                let condition = args[1].toLowerCase()
                switch (condition) {
                    case 'admin':
                        await sock.groupSettingUpdate(from, "announcement")
                        break;
                    case 'everyone':
                        await sock.groupSettingUpdate(from, "not_announcement")
                        break;
                    default:
                        await sock.sendMessage(from, { text: 'Select who can send message to this group, admin/everyone' }, { quoted: msg })
                }
                break;
            }
            default:
                await sock.sendMessage(from, { text: 'Here all available group setting, ephemeral | edit_group | send_message' }, { quoted: msg })
        }
    }
}

function getAdmins(a) {
    let admins = []
    for (let ids of a) {
        !ids.admin ? '' : admins.push(ids.id)
    }
    return admins
}