const { inputData, getData } = require("../../event/database/user_setting");
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
        try {
            let opt = args[0], data, year;
            switch (opt) {
                case "reg":
                    year = args.slice(1)[0];
                    if (typeof year === "undefined" || year === "") return await msg.reply("Need to input your birth year");
                    if (isNaN(parseInt(year))) return await msg.reply("Use number format!");
                    data = await inputData(sender, year);
                    if (data.status === 406) return await msg.reply(data.msg);
                    await msg.reply(data.msg);
                    break;
                case "upreg":
                    year = args.slice(1)[0];
                    if (typeof year === "undefined" || year === "") return await msg.reply("Need to input your birth year");
                    if (isNaN(parseInt(year))) return await msg.reply("Use number format!");
                    data = await inputData(sender, year);
                    if (data.status === 406) return await msg.reply(data.msg);
                    await msg.reply(data.msg);
                    break;
                case "code":
                    await msg.reply(`View Online: http://hiken.xyz/v/${args.slice(1)[0]}\nDownload: http://hiken.xyz/g/${args.slice(1)[0]}`)
                    break;
                default:
                    if (!userData[sender] || userData === "no_file") return await msg.reply("Please, register first\n!nuke reg <year of birth>");
                    if (!userData[sender]["eligible"]) return msg.reply("You are not eligible to use this command.");
                    data = await getCode(args[0])
                    await sock.sendMessage(from, {
                        image: { url: data.image },
                        caption: data.data,
                        templateButtons: [
                            { urlButton: { displayText: "View Online", url: `http://hiken.xyz/v/${args[0]}` } },
                            { urlButton: { displayText: "Download", url: `http://hiken.xyz/g/${args[0]}` } },
                            { quickReplyButton: { displayText: "Get Link", id: `!nuke code ${args[0]}` } }
                        ]
                    })
            }
        } catch (e) {
            await msg.reply(`Error:${e.message}`)
        }
    }
}

async function getCode(code) {
    if (nhentai.exists(code)) {
        let doujin = await nhentai.getDoujin(code);
        let text = `*📕Title:* ${doujin.title}\n*📚tags:* ${doujin.details?.tags?.map((v) => `${v.split(" (")[0]}`)?.join(", ")}\n`
            + `*👤Artist(s):* ${doujin.details?.artists?.map((v) => `${v.split(" (")[0]}`)?.join(", ")}\n*🌐Language(s):* ${doujin.details?.languages?.map((v) => `${v.split(" (")[0]}`)?.join(", ")}\n`
            + `*🔖Categories:* ${doujin.details?.categories?.map((v) => `${v.split(" (")[0]}`)?.join(", ")}\n*🔱Pages:* ${doujin.details?.pages[0]}\n*📢Upload:* ${doujin.details?.uploaded[0]}`
        return { data: text, image: doujin.pages[0] }
    } else {
        throw "Code doesn't exist"
    }
}