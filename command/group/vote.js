const { footer } = require("../../config.json");
const UtilVotes = require("../../event/database/votes");
const vote = new UtilVotes();

module.exports = {
	name: "vote",
	limit: true,
	consume: 5,
	premium: true,
	premiumType: ["nulgath", "artix"],
	desc: "Create a voting message",
	use:
		"<option>\n\n*Options*:\n- start (start new vote)\n- up (upvote active vote)\n" +
		"- down (downvote active vote)\n- show (show vote data)\n- del_vote (delete your vote)\n" +
		"- del_room (delete current vote. Vote owner only)",
	category: "group",
	async exec({ sock, msg, args }) {
		const { from, isGroup, sender } = msg;
		let voteState = args[0],
			voteData = vote.show(from),
			buttons,
			status = "";

		if (!isGroup) return await msg.reply("Only inside a group chat");
		if (!args.length > 0) {
			await sock.sendMessage(
				from,
				{
					text: `#vote ${this.use}`,
					footer: footer,
				},
				{ quoted: msg }
			);
		}

		try {
			if (voteState === "start") {
				if (voteData.present)
					return await msg.reply("There is already vote in this group\nplease, end current vote.");
				vote.create(from, sender, args.splice(1).join(" "));
				if (vote.show(from).present) {
					buttons = [
						{ buttonId: "#vote up SMH", buttonText: { displayText: "Upvote" }, type: 1 },
						{ buttonId: "#vote down SMH", buttonText: { displayText: "Downvote" }, type: 1 },
					];
					await sock.sendMessage(
						from,
						{
							text: `Vote name: *${vote.show(from).data.name}*\n\nVote created.`,
							footer: footer,
							buttons,
						},
						{ quoted: msg }
					);
				}
			} else if (voteState === "up") {
				if (!voteData.present)
					return await msg.reply("Please, create a vote first before.\nExample: *!vote start*");
				status = vote.upvote(from, sender);
				if (status === "added") {
					await msg.reply("You voted.");
				} else if (status === "voted") {
					await msg.reply("You already voted, can't vote again.");
				}
			} else if (voteState === "down") {
				if (!voteData.present)
					return await msg.reply("Please, create a vote first before.\nExample: *!vote start*");
				status = vote.downvote(from, sender);
				if (status === "added") {
					await msg.reply("Success downvote this vote.");
				} else if (status === "downvoted") {
					await msg.reply("You already down voted this vote.");
				}
			} else if (voteState === "show") {
				if (!voteData.present)
					return await msg.reply("Please, create a vote first before.\nExample: *!vote start*");
				//
				voteData = voteData.data;
				let text =
					`Current Group Vote (${voteData["name"]})\nOwner: ${voteData["owner"].split("@")[0]}\n\n` +
					`Upvote:\n- ${voteData["upvote"].map((v) => `@${v.split("@")[0]}`).join("\n- ")}\n\n` +
					`Downvote:\n- ${voteData["downvote"].map((v) => `@${v.split("@")[0]}`).join("\n- ")}\n`;
				buttons = [
					{ buttonId: "#vote del_vote SMH", buttonText: { displayText: "Delete Your Vote" }, type: 1 },
					{ buttonId: "#vote del_room SMH", buttonText: { displayText: "Delete Vote" }, type: 1 },
				];
				await sock.sendMessage(
					from,
					{
						text,
						mentions: [...voteData["upvote"], ...voteData["downvote"]],
						footer: footer,
						buttons,
					},
					{ quoted: msg }
				);
			} else if (voteState === "del_vote") {
				if (!voteData.present)
					return await msg.reply("Please, create a vote first before.\nExample: *!vote start*");
				status = vote.delete_vote(from, sender);
				if (status === "deleted") {
					await msg.reply("Deleted your vote.");
				} else if (status === "no_vote") {
					await msg.reply("You never participate in this vote.");
				}
			} else if (voteState === "del_room") {
				if (!voteData.present) return await msg.reply("No active vote in this group.");
				if (voteData["data"]["owner"] !== sender) return await msg.reply("You're not the owner.");
				status = vote.delete(from, sender);
				if (status) {
					await msg.reply("Vote deleted.");
				}
			}
			voteData = null;
		} catch (e) {
			await msg.reply(`Error: ${e.message}`);
		}
	},
};
