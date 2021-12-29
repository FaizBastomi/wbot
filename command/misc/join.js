module.exports = {
    name: "join",
    category: "misc",
    desc: "Join to group using invite url.",
    async exec(msg, sock, args) {
        // search for invite url
        const rex1 = /chat.whatsapp.com\/([\w\d]*)/g;
        let code = args.join(" ").match(rex1);
        if (code === null) return await sock.sendMessage(msg.from, { text: "No invite url detected." }, { quoted: msg });
        code = code[0].replace("chat.whatsapp.com/", "");
        // check invite code
        const check = await sock.groupQueryInvite(code).catch(async () => {
            await sock.sendMessage(msg.from, { text: "Invalid invite url." }, { quoted: msg });
        })
        // 
        if (check.size < 80) return await sock.sendMessage(msg.from, { text: "The minimum requirement for group members must be more than 80 people." }, { quoted: msg });
        // Trying to join group with given invite code
        await sock.groupAcceptInvite(code).catch(async () => {
            await sock.sendMessage(msg.from, { text: "Looks like the group already full or became invalid when I'm trying to join :/" }, { quoted: msg });
        });
        await sock.sendMessage(msg.from, { text: "Success join into your group." }, { quoted: msg });
    }
}