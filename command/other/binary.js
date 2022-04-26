module.exports = {
	name: "bin",
	category: "random",
	use: "<encrypt|decrypt> <some string>",
	async exec({ msg, args }) {
		try {
			if (msg.quoted) {
				let opts = args[0];
				switch (opts) {
					case "encrypt":
						await msg.reply(eBinary(msg.quoted.text));
						break;
					case "decrypt":
						await msg.reply(dBinary(msg.quoted.text));
						break;
					default:
						await msg.reply("Option not available");
				}
			} else if (args.length >= 2) {
				let opts = args[0];
				switch (opts) {
					case "encrypt":
						await msg.reply(eBinary(args.slice(1).join(" ")));
						break;
					case "decrypt":
						await msg.reply(dBinary(args.slice(1).join(" ")));
						break;
					default:
						await msg.reply("Option not available");
				}
			} else {
				await msg.reply("Please, refer to !help bin");
			}
		} catch (e) {
			await msg.reply(e.message);
		}
	},
};

function dBinary(str) {
	let newBin = str.split(" ").map((hex) => {
		return Buffer.from(hex, "hex").toString("binary");
	});
	let binCode = [];
	for (i = 0; i < newBin.length; i++) {
		binCode.push(String.fromCharCode(parseInt(newBin[i], 2)));
	}
	return binCode.join("");
}

function eBinary(str = "") {
	let res = "";
	res = str
		.split("")
		.map((char) => {
			return char.charCodeAt(0).toString(2);
		})
		.join(" ");
	let hex = res.split(" ").map((char) => {
		return Buffer.from(char, "binary").toString("hex");
	});
	return hex.join(" ");
}
