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
                        await sock.sendMessage(msg.from, {
                            text: kata_bijak[~~(Math.random() * kata_bijak.length)]
                        }, { quoted: msg });
                        break;
                    case "pantun":
                        await sock.sendMessage(msg.from, {
                            text: pantun[~~(Math.random() * pantun.length)].split("|").join("\n")
                        }, { quoted: msg });
                        break;
                    case "fakta":
                        await sock.sendMessage(msg.from, {
                            text: fakta[~~(Math.random() * fakta.length)]
                        }, { quoted: msg });
                        break;
                }
            }
        } catch (e) {
            await sock.sendMessage(msg.from, { text: `Something bad happend\n${e.message}` }, { quoted: msg });
        }
    }
}