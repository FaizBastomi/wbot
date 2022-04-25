let cp = require("child_process");
let { promisify } = require("util");
let exec = promisify(cp.exec).bind(cp);

module.exports = {
	name: "term",
	alias: ["exec"],
	category: "private",
	async exec({ msg, conn, args, arg, isOwner }) {
                if (!isOwner) return msg.reply("This command is only for the owner")
		await msg.reply("Executing...");
		let o;
		try {
			o = await exec(arg);
		} catch (e) {
			o = e;
		} finally {
			let { stdout, stderr } = o;
			if (stdout.trim()) msg.reply(stdout);
			if (stderr.trim()) msg.reply(stderr);
		}
	},
};
