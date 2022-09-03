const os = require("os");
const { formatSize } = require("../../utils");

module.exports = {
	name: "stats",
	alias: ["status"],
	category: "misc",
	desc: "Bot Stats",
	async exec({ msg }) {
		let cpus = os.cpus(),
			txt =
				`*Server:*\n\n- Nodejs: ${process.version}\n- Memory: ${
					formatSize(os.totalmem() - os.freemem()) + "/" + formatSize(os.totalmem())
				}\n` +
				`- CPU: ${cpus[0].model} ${
					cpus.length > 1 ? `(${cpus.length} core)` : ""
				}\n- Platform: ${os.platform()}`;
		await msg.reply(txt);
	},
};
