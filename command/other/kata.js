const fs = require("fs");
const join = require("path").join;
let pantun = fs.readFileSync(join(__dirname, "text/pantun.txt"), { encoding: "utf-8" }).split("\n");
let kata_bijak = fs.readFileSync(join(__dirname, "text/katabijax.txt"), { encoding: "utf-8" }).split("\n");
let fakta = fs.readFileSync(join(__dirname, "text/faktaunix.txt"), { encoding: "utf-8" }).split("\n");

module.exports = {
    name: "kata",
    category: "random",
    use: "<kategori>\n\n- bijak\n- pantun\n- fakta",
    async exec(msg, sock, args) {
        try {
            if (!args.length > 0) {
                const secs = [{
                    title: "Pilihan Kata",
                    rows: [
                        { title: "Pantun", rowId: "#kata pantun", description: "Kata pantun acak" },
                        { title: "Kata Bijak", rowId: "#kata bijak", description: "Kata bijak acak" },
                        { title: "Fakta Unik", rowId: "#kata fakta", description: "Fakta unik" }
                    ]
                }]
                await sock.sendMessage(msg.from, {
                    text: "Silahkan Pilih Melalui Tombol Dibawah.",
                    footer: "Kaguya PublicBot • FaizBastomi",
                    title: "Random Kata",
                    buttonText: "List",
                    sections: secs
                })
            } else {
                const type = args[0].toLowerCase();
                switch (type) {
                    case "bijak":
                        await msg.reply(kata_bijak[~~(Math.random() * kata_bijak.length)]);
                        break;
                    case "pantun":
                        await msg.reply(pantun[~~(Math.random() * pantun.length)].split("|").join("\n"));
                        break;
                    case "fakta":
                        await msg.reply(fakta[~~(Math.random() * fakta.length)]);
                        break;
                }
            }
        } catch (e) {
            await msg.reply(`Something bad happend\n${e.message}`);
        }
    }
}