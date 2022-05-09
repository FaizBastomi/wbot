const fs = require("fs");
const join = require("path").join;
const { footer } = require("../../config.json");
let pantun = fs.readFileSync(join(__dirname, "text/pantun.txt"), { encoding: "utf-8" }).split("\n");
let kata_bijak = fs.readFileSync(join(__dirname, "text/katabijax.txt"), { encoding: "utf-8" }).split("\n");
let fakta = fs.readFileSync(join(__dirname, "text/faktaunix.txt"), { encoding: "utf-8" }).split("\n");

const random = (a) => {
	return a[~~(Math.random() * a.length)];
};

module.exports = {
	name: "kata",
	category: "random",
	use: "<kategori>\n\n- bijak\n- pantun\n- fakta",
	async exec({ sock, msg, args }) {
		try {
			if (!args.length > 0) {
				const secs = [
					{
						title: "Pilihan Kata",
						rows: [
							{ title: "Pantun", rowId: "#kata pantun", description: "Kata pantun acak" },
							{ title: "Kata Bijak", rowId: "#kata bijak", description: "Kata bijak acak" },
							{ title: "Fakta Unik", rowId: "#kata fakta", description: "Fakta unik" },
						],
					},
				];
				await sock.sendMessage(msg.from, {
					text: "Silahkan Pilih Melalui Tombol Dibawah.",
					footer: footer,
					title: "Random Kata",
					buttonText: "List",
					sections: secs,
				});
			} else {
				const type = args[0].toLowerCase();
				switch (type) {
					case "bijak":
						await msg.reply(random(kata_bijak));
						break;
					case "pantun":
						await msg.reply(random(pantun).split("|").join("\n"));
						break;
					case "fakta":
						await msg.reply(random(fakta));
						break;
				}
			}
		} catch (e) {
			await msg.reply(`Something bad happend\n${e.message}`);
		}
	},
};
