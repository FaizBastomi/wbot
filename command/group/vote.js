const UtilVotes = require("../../event/database/votes");
const vote = new UtilVotes();

module.exports = {
    name: "vote",
    desc: "Create a voting message",
    use: "<option>\n\n*Options*:\n- create (create new vote room)\n- up (upvote current active vote room)\n"
        + "- down (downvote current active vote room)\n- show (show current vote room data)\n- del_vote (delete your vote)\n"
        + "- del_room (delete current vote room. Owner room only)",
    category: "group",
    async exec(msg, sock, args) {
        const { from, isGroup, sender } = msg;
        if (!isGroup) return await msg.reply("Only inside a group chat");
        if (!args.length > 0) return await msg.reply("Please, read availabe option at #help vote");

        let voteState = args[0],
            voteData = vote.show(from),
            sections, status = "";

        try {
            if (voteState === "create") {
                if (voteData.present) return await msg.reply(
                    "There is already vote room in this group\nplease, delete current room."
                )
                vote.create(from, sender, args.splice(1).join(" "));
                if (
                    (vote.show(from)).present
                ) {
                    sections = [{
                        title: "Select Options", rows: [
                            { title: "Upvote", description: "Upvote this vote", rowId: "#vote up" },
                            { title: "Downvote", description: "Downvote this vote", rowId: "#vote down" },
                            { title: "Show", description: "Show current vote room data", rowId: "#vote show" },
                            { title: "Delete Vote", description: "Delete your vote", rowId: "#vote del_vote" },
                            { title: "Delete Room", description: "Delete current room (Room owner only)", rowId: "#vote del_room" }
                        ]
                    }]
                    await sock.sendMessage(from, {
                        text: "Room created.",
                        footer: "Kaguya PublicBot • FaizBastomi",
                        buttonText: "Vote",
                        sections
                    }, { quoted: msg });
                }
            }
            else if (voteState === "up") {
                if (!voteData.present) return await msg.reply("Please, create a vote room first before.\nExample: *!vote create*");
                status = vote.upvote(from, sender);
                if (status === "added") {
                    await msg.reply("You voted.");
                } else if (status === "voted") {
                    await msg.reply("You already voted, can't vote again.");
                }
            }
            else if (voteState === "down") {
                if (!voteData.present) return await msg.reply("Please, create a vote room first before.\nExample: *!vote create*");
                status = vote.downvote(from, sender);
                if (status === "added") {
                    await msg.reply("Success downvote current active vote.");
                } else if (status === "downvoted") {
                    await msg.reply("You already down voted this vote.");
                }
            }
            else if (voteState === "show") {
                if (!voteData.present) return await msg.reply("Please, create a vote room first before.\nExample: *!vote create*");
                // 
                voteData = voteData.data;
                let text = `Current Group Vote (${voteData["name"]})\nOwner: ${voteData["owner"].split("@")[0]}\n\n`
                    + `Upvote:\n- ${voteData["upvote"].map(v => `@${v.split("@")[0]}`).join("\n- ")}\n\n`
                    + `Downvote:\n- ${voteData["downvote"].map(v => `@${v.split("@")[0]}`).join("\n- ")}\n`
                sections = [{
                    title: "Select Options", rows: [
                        { title: "Upvote", description: "Upvote this vote", rowId: "#vote up" },
                        { title: "Downvote", description: "Downvote this vote", rowId: "#vote down" },
                        { title: "Show", description: "Show current vote room data", rowId: "#vote show" },
                        { title: "Delete Vote", description: "Delete your vote", rowId: "#vote del_vote" },
                        { title: "Delete Room", description: "Delete current room (Room owner only)", rowId: "#vote del_room" }
                    ]
                }]
                await sock.sendMessage(from, {
                    text,
                    mentions: [
                        ...voteData["upvote"],
                        ...voteData["downvote"]
                    ],
                    footer: "Kaguya PublicBot • FaizBastomi",
                    buttonText: "Vote",
                    sections
                }, { quoted: msg });
            }
            else if (voteState === "del_vote") {
                if (!voteData.present) return await msg.reply("Please, create a vote room first before.\nExample: *!vote create*");
                status = vote.delete_vote(from, sender);
                if (status === "deleted") {
                    await msg.reply("Deleted your vote from current room.");
                }
                else if (status === "no_vote") {
                    await msg.reply("You never participate in current vote room.");
                }
            }
            else if (voteState === "del_room") {
                if (!voteData.present) return await msg.reply("No active vote room in this group.");
                if (voteData["data"]["owner"] !== sender) return await msg.reply("You're not the room owner.");
                status = vote.delete(from, sender);
                if (status) {
                    await msg.reply("Room deleted.");
                }
            }
            voteData = null;
        } catch (e) {
            await msg.reply(`Error: ${e.message}`);
        }
    }
}