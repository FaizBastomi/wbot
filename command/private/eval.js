const { owner } = require("../../config.json");

module.exports = {
    name: "eval",
    alias: ['ev', 'e', '>>', '=>'],
    category: "private",
    async exec(msg, sock, args) {
        const { sender, from } = msg;

        if (!owner.includes(sender)) return await sock.sendMessage(from, { text: "You are not my owner" }, { quoted: msg });
        let code = args.join(" ");
        let text = "";
        try {
            const input = clean(code);
            if (!code) return await sock.sendMessage(from, { text: "What your JavaScript code?" }, { quoted: msg })
            text = `*INPUT*\n\`\`\`${input}\`\`\`\n`;

            let evaled;
            if (code.includes("-s") && code.includes("-as")) {
                code = code.replace("-as", "").replace("-s", "");

                return await eval(`(async() => { ${code} })()`);
            } else if (code.includes("-as")) {
                code = code.replace("-as", "")

                evaled = await eval(`(async() => { ${code} })()`)
            } else if (code.includes("-s")) {
                code = code.replace("-s", "")

                return await eval(code);
            } else evaled = await eval(code);

            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled, { depth: 0 })

            let output = clean(evaled);
            text += `\n*OUTPUT*\n\`\`\`${output}\n\`\`\``
            await sock.sendMessage(from, { text }, { quoted: msg })
        } catch (e) {
            const err = clean(e);
            text += `\n*ERROR*\n\`\`\`${err}\n\`\`\``
            await sock.sendMessage(from, { text }, { quoted: msg })
        }
    }
};

function clean(text) {
    if (typeof text === "string")
        return text
            .replace(/`/g, `\`${String.fromCharCode(8203)}`)
            .replace(/@/g, `@${String.fromCharCode(8203)}`);
    // eslint-disable-line prefer-template
    else return text;
}