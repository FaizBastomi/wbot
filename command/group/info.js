const { getData } = require("../../database/group_setting");

module.exports = {
    name: "groupinfo",
    alias: ["gcinfo", "grupinfo", "grupstats", "groupstats","gcstats"],
    category: "group",
    desc: "Show this group information",
    async exec(msg, sock) {
        const { from, isGroup } = msg;
        if (!isGroup) return await sock.sendMessage(from, { text: "Only can be executed in group" });

        try {
            const gcMeta = isGroup ? await sock.groupMetadata(from) : '';
            const ppGroup = isGroup ? await sock.profilePictureUrl(from) : 'https://tinyurl.com/yeon6okd';
            let dataConf = await getData(from.split('@')[0]);
            if (typeof dataConf !== "object") dataConf = {};

            let text = `\`\`\`\nSubject: ${gcMeta?.subject}\nOwner: ${gcMeta?.owner}\nID: ${gcMeta?.id}\nSize: ${gcMeta?.participants?.length}\n`
            text += `Created: ${new Date(gcMeta?.creation * 1000).toLocaleString()} \nWelcome: ${dataConf?.["join"]?.["active"] ? "ON" : "OFF"}\nLeft: ${dataConf?.["left"]?.["active"] ? "ON" : "OFF"}\n`
            text += `Desc:\n${gcMeta?.desc ? gcMeta?.desc?.toString() : 'Empty'}\`\`\``

            await sock.sendMessage(from, { image: { url: ppGroup }, caption: text }, { quoted: msg });
        } catch {
            await sock.sendMessage(from, { text: "Something bad happend" })
        }
    }
}