const { owner } = require("../../config.json");

module.exports = {
    name: "profile",
    alias: ["p", "pro"],
    category: "general",
    desc: "Show your info",
    async exec(msg, sock) {
        const { pushName, from, isGroup, sender } = msg;
        if (!isGroup) return await msg.reply("Only can be executed in group");
        try {
        const meta = isGroup ? await sock.groupMetadata(from) : ''        
        const groupMem = isGroup ? meta.participants : ''                 
        const admin = isGroup ? getAdmin(groupMem) : ''                   
        const cekAdmin = (m) => admin.includes(m)
            const bio = await sock.fetchStatus(sender)
            try {
                pfp = await sock.profilePictureUrl(sender, "image");
            } catch { pfp = 'https://tinyurl.com/yeon6okd' }
let text = "";
text += `🔰 *Name* : ${pushName === undefined ? sender.split("@")[0] : pushName}\n\n💡 *Number* : ${sender}\n\n🗯 *Group* : ${meta?.subject}\n\n📑 *Bio*: ${bio.status}\n\n`
if (owner.includes(sender))
text += `🛎 *Owner* : True\n\n`
if (cekAdmin(sender)) 
text += `📔 *Admin* : True`

                        await sock.sendMessage(from, { image: { url: pfp }, caption: text }, { quoted: msg });
        } catch(err){
            await msg.reply(err);
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
