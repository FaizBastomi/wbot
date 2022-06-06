const os = require("os");
const fs = require("fs");
const { formatSize } = require("../../utils");
const { session } = require(`../../config.json`);

module.exports = {
	name: "stats",
	alias: ["status"],
	category: "misc",
	desc: "Bot Stats",
	async exec({ msg }) {
		let cpus = os.cpus(),
			sessionStats = fs.statSync(`./${session}`),
			txt =
				`*Server:*\n\n- Nodejs: ${process.version}\n- Memory: ${
					formatSize(os.totalmem() - os.freemem()) + "/" + formatSize(os.totalmem())
				}\n` +
				`- CPU: ${cpus[0].model} ${
					cpus.length > 1 ? `(${cpus.length} core)` : ""
				}\n- Platform: ${os.platform()}\n- Session Size: ${formatSize(sessionStats.size)}`;
		await msg.reply(txt);
	},
};
