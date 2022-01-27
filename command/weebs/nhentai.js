const { inputData, getData } = require("../../database/user_setting");
const { generateWAMessageFromContent, generateWAMessageContent, proto } = require("@adiwajshing/baileys");
const nhentai = require("nhentai-js");

module.exports = {
    name: "nuke",
    alias: ["nhentai", "ncode"],
    category: "weebs",
    use: "<nuke code>",
    async exec(msg, sock, args) {
        const { from, sender, isGroup } = msg;
        const userData = getData();
        if (isGroup) return await msg.reply("Can't use this command inside the group.");
        if (!userData[sender]) return await msg.reply("Please, register first\n!nuke reg <year of birth>");
        try {
            let opt = args[0];
            let data;
            let year;
            switch (opt) {
                case "reg":
                    year = args.slice(1)[0];
                    if (year === "") return await msg.reply("Need to input your birth year");
                    data = await inputData(sender, year);
                    if (data.status === 406) return await msg.reply(data.msg);
                    await msg.reply(data.msg);
                    break;
                case "upreg":
                    year = args.slice(1)[0];
                    if (year === "") return await msg.reply("Need to input your birth year");
                    data = await inputData(sender, year);
                    if (data.status === 406) return await msg.reply(data.msg);
                    await msg.reply(data.msg);
                    break;
                default:
                    if (!userData[sender]["eligible"]) return msg.reply("You are not eligible to use this command.");
                    data = await getCode(args[0])
                    const img = await generateWAMessageContent({ image: { url: data.image } })
                    const prep = generateWAMessageFromContent(from, proto.Message.fromObject({
                        templateMessage: {
                            hydratedTemplate: {
                                imageMessage: img.imageMessage,
                                hydratedButtons: [
                                    { urlButton: { displayText: "View Online", url: `https://hiken.xyz/v/${args[0]}` } },
                                    { urlButton: { displayText: "Download", url: `https://hiken.xyz/g/${args[0]}` } }
                                ]
                            }
                        }
                    }))
                    await sock.relayMessage(from, prep.message, { messageId: prep.key.id });
            }
        } catch (e) {
            await msg.reply(`Error:${e.message}`)
        }
    }
}

async function getCode(code) {
    if (nhentai.exists(code)) {
        let doujin = await nhentai.getDoujin(code);
        let text = `*📕Title:* ${doujin.title}\n*📚tags:* ${doujin.details.tags.map((v) => `${v.split(" (")[0]}`).join(", ")}\n`
            + `*👤Artist(s):* ${doujin.details.artists.map((v) => `${v.split(" (")}`).join(", ")}\n*🌐Language(s):* ${doujin.details.languages.map((v) => `${v.split(" (")}`).join(", ")}\n`
            + `*🔖Categories:* ${doujin.details.categories.map((v) => `${v.split(" (")}`).join(", ")}\n*🔱Pages:* ${doujin.details.pages[0]}\n*📢Upload:* ${doujin.details.uploaded[0]}`
        return { data: text, image: doujin.pages[0] }
    } else {
        throw "Code doesn't exist"
    }
}