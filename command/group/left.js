const { checkData, modifyData } = require("../../database/group_setting")
const lang = require("../other/text.json")

module.exports = {
    name: "left",
    desc: "Setting left message in your group",
    category: "group",
    use: "_options_ _value_\n\n"
        + "*Options*\n~ on - turned on left message\n"
        + "~ off - turned off left message\n"
        + "~ message - set custom message\n\n"
        + "Ex:\n!left on\n!left off\n\n"
        + "For custom message:\n%member - tag new member\n%group - group name\n%desc - group description\n\n"
        + "Ex: !left message %member leaving us",
    async exec(msg, sock, args) {
        const { from, isGroup, sender } = msg
        const gM = isGroup ? await sock.groupMetadata(from) : ''
        const admin = isGroup ? getAdmin(gM.participants) : ''
        const cekAdmin = (m) => admin.includes(m)

        if (!isGroup) return await sock.sendMessage(from, { text: "Only can be executed in group." });
        if (!cekAdmin(sender)) return await sock.sendMessage(from, { text: `IND:\n${lang.indo.group.promote.noPerms}\n\nEN:\n${lang.eng.group.promote.noPerms}` }, { quoted: msg });
        if (!args.length > 0) return await sock.sendMessage(from, { text: "Please check #help left" }, { quoted: msg });

        // Command
        let opt = args[0]
        let filename = from.split('@')[0]
        let dataOn
        switch (opt) {
            case "on":
                dataOn = checkData(filename, "on/left")
                if (dataOn === "active") {
                    return await sock.sendMessage(from, { text: "```Already active/Sudah aktif```" }, { quoted: msg })
                } else if (dataOn === "no_file" || dataOn === "inactive") {
                    modifyData(filename, "on/left");
                    return await sock.sendMessage(from, { text: "```Activated/Telah diaktifkan```" }, { quoted: msg })
                }
                break;
            case "off":
                dataOn = checkData(filename, "on/left")
                if (dataOn === "inactive") {
                    return await sock.sendMessage(from, { text: "```Never active/Tidak pernah aktif```" }, { quoted: msg })
                } else if (dataOn === "no_file") {
                    return await sock.sendMessage(from, { text: "```Please actived this feature first/Harap aktifkan fitur ini dahulu```" }, { quoted: msg })
                } else if (dataOn === "active") {
                    modifyData(filename, "on/left")
                    return await sock.sendMessage(from, { text: "```Success deactivated/Berhasil di nonaktifkan```" }, { quoted: msg })
                }
                break;
            case "message":
                modifyData(filename, "left", args.slice(1).join(" "))
                await sock.sendMessage(from, { text: "```Custom message edited successfully/Pesan custom berhasil di edit```" }, { quoted: msg });
                break;
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
