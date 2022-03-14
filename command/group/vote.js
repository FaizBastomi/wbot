let voteMap = new Map();

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
            voteData = voteMap.get(from),
            isVotePresent = voteMap.has(from),
            status, sections;

        try {
            if (voteState === "create") {
                if (isVotePresent) return await msg.reply(
                    "There is already vote room in this group\nplease, delete current room."
                )
                makeRoom(from, "create_room", sender, args.splice(1).join(" "));
                if (voteMap.has(from)) {
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
                if (!isVotePresent) return await msg.reply("Please, create a vote room first before.\nExample: *!vote create*");
                status = updateVote(from, sender, "up");
                if (status === "added") {
                    await msg.reply("You voted.");
                } else if (status === "voted") {
                    await msg.reply("You already voted, can't vote again.");
                }
            }
            else if (voteState === "down") {
                if (!isVotePresent) return await msg.reply("Please, create a vote room first before.\nExample: *!vote create*");
                status = updateVote(from, sender, "down");
                if (status === "vote_down") {
                    await msg.reply("Success downvote current active vote.");
                } else if (status === "down_voted") {
                    await msg.reply("You already down voted this vote.");
                }
            }
            else if (voteState === "show") {
                if (!isVotePresent) return await msg.reply("Please, create a vote room first before.\nExample: *!vote create*");
                // 
                let text = `Current Group Vote (${voteData["name"]})\nOwner: ${voteData["owner"].split("@")[0]}\n\n`
                    + `Upvote:\n- ${voteData["voted"].map(v => `@${v.split("@")[0]}`).join("\n- ")}\n\n`
                    + `Downvote:\n- ${voteData["down"].map(v => `@${v.split("@")[0]}`).join("\n- ")}\n`
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
                        ...voteData["voted"],
                        ...voteData["down"]
                    ],
                    footer: "Kaguya PublicBot • FaizBastomi",
                    buttonText: "Vote",
                    sections
                }, { quoted: msg });
            }
            else if (voteState === "del_vote") {
                if (!isVotePresent) return await msg.reply("Please, create a vote room first before.\nExample: *!vote create*");
                status = updateVote(from, sender, "delete");
                if (status === "vote_del") {
                    await msg.reply("Deleted your vote from current room.");
                }
                else if (status === "no_data") {
                    await msg.reply("You never participate in current vote room.");
                }
            }
            else if (voteState === "del_room") {
                if (!isVotePresent) return await msg.reply("No active vote room in this group.");
                if (voteData["owner"] !== sender) return await msg.reply("You're not the room owner.");
                status = makeRoom(from, "delete_room");
                if (status === "deleted") {
                    await msg.reply("Room deleted.");
                }
            }
            voteData = null;
        } catch (e) {
            await msg.reply(`Error: ${e.message}`);
        }
    }
}

/**
 * Make new room for vote
 * @param {string} roomId group current id
 * @param {"create_room"|"delete_room"} status status
 * @param {string} roomOwner room creator number/id
 */
const makeRoom = (roomId, status, roomOwner, name = "Default Room") => {
    if (status === "create_room") {
        if (name === "") name = "Default Room";
        voteMap.set(roomId, { owner: roomOwner, name, voted: [], down: [] })
        return "new_room";
    }
    else if (status === "delete_room") {
        voteMap.delete(roomId);
        return "deleted";
    }
}

/**
 * 
 * @param {string} roomId group current id
 * @param {string} voterId voter number/id
 * @param {"up"|"down"|"delete"} status status
 */
const updateVote = (roomId, voterId, status) => {
    let $data = voteMap.get(roomId);
    if (status === "up") {
        if ($data["down"].includes(voterId)) {
            $data["down"].splice($data["down"].indexOf(voterId), 1);
            $data["voted"].push(voterId);
            // update data
            voteMap.set(roomId, $data);
            $data = null;
            return "added";
        }
        else if (!$data["voted"].includes(voterId)) {
            $data["voted"].push(voterId);
            voteMap.set(roomId, $data);
            $data = null;
            return "added";
        }
        else if ($data["voted"].includes(voterId)) {
            return "voted";
        }
    }
    else if (status === "down") {
        if ($data["voted"].includes(voterId)) {
            $data["voted"].splice(
                $data["voted"].indexOf(voterId),
                1
            );
            $data["down"].push(voterId);
            // update data
            voteMap.set(roomId, $data);
            $data = null;
            return "vote_down";
        }
        else if (!$data["down"].includes(voterId)) {
            $data["down"].push(voterId);
            voteMap.set(roomId, $data);
            $data = null;
            return "vote_down";
        }
        else if ($data["down"].includes(voterId)) {
            return "down_voted";
        }
    }
    else if (status === "delete") {
        if ($data["voted"].includes(voterId)) {
            $data["voted"].splice(
                $data["voted"].indexOf(voterId),
                1
            );
            voteMap.set(roomId, $data);
            $data = null;
            return "vote_del";
        }
        else if ($data["down"].includes(voterId)) {
            $data["down"].splice(
                $data["down"].indexOf(voterId),
                1
            );
            voteMap.set(roomId, $data);
            $data = null;
            return "vote_del";
        }
        else if (
            !$data["voted"].includes(voterId) &&
            !$data["down"].includes(voterId)
        ) {
            return "no_data";
        }
    }
}