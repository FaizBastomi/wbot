let cp = require("child_process");
let { promisify } = require("util");
let exec = promisify(cp.exec).bind(cp);

module.exports = {
	name: "term",
	alias: ["exec"],
	category: "private",
	owner: true,
	async exec({ msg, args }) {
		await msg.reply("Executing...");
		let o;
		try {
			o = await exec(args.join(" "));
		} catch (e) {
			o = e;
		} finally {
			let { stdout, stderr } = o;
			if (stdout.trim()) msg.reply(stdout);
			if (stderr.trim()) msg.reply(stderr);
		}
	},
};
