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

        if (!isGroup) return await msg.reply(`Only can be executed in group.`);
        if (args.length < 1) return await msg.reply('Here all available group setting, ephemeral | edit_group | send_message');
        if (!cekAdmin(sender)) return await msg.reply(`IND:\n${lang.indo.group.gcset.noPerms}\n\nEN:\n${lang.eng.group.gcset.noPerms}`);
        if (!cekAdmin(myID)) return await msg.reply(`IND:\n${lang.indo.group.gcset.botNoPerms}\n\nEN:\n${lang.eng.group.gcset.botNoPerms}`);

        let setting = args[0].toLowerCase()
        switch (setting) {
            case 'ephemeral': {
                if (args.length < 2) return await msg.reply('Some argument appear to be missing');
                let condition = args[1].toLowerCase()
                switch (condition) {
                    case 'on': case 'aktif':
                        await sock.groupToggleEphemeral(from, WA_DEFAULT_EPHEMERAL);
                        break;
                    case 'off': case 'mati':
                        await sock.groupToggleEphemeral(from, 0)
                        break;
                    default:
                        await msg.reply('Select setting condition, on/off');
                }
                break
            }
            case 'edit_group': {
                if (args.length < 2) return await msg.reply('Some argument appear to be missing');
                let condition = args[1].toLowerCase()
                switch (condition) {
                    case 'admin':
                        await sock.groupSettingUpdate(from, "locked")
                        break;
                    case 'everyone':
                        await sock.groupSettingUpdate(from, "unlocked")
                        break;
                    default:
                        await msg.reply('Select who can edit group info, admin/everyone');
                }
                break;
            }
            case 'send_message': {
                if (args.length < 2) return await msg.reply('Some argument appear to be missing');
                let condition = args[1].toLowerCase()
                switch (condition) {
                    case 'admin':
                        await sock.groupSettingUpdate(from, "announcement")
                        break;
                    case 'everyone':
                        await sock.groupSettingUpdate(from, "not_announcement")
                        break;
                    default:
                        await msg.reply('Select who can send message to this group, admin/everyone');
                }
                break;
            }
            default:
                await msg.reply('Here all available group setting, ephemeral | edit_group | send_message');
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