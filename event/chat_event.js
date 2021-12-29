const { serialize } = require("../lib/helper")
const djs = require("@discordjs/collection")
const { color } = require("../utils")

const cooldown = new djs.Collection();
const prefix = '!';
const multi_pref = new RegExp('^[' + '!#$%&?/;:,.<>~-+='.replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');

function printSpam(isGc, sender, gcName) {
    if (isGc) {
        return console.log(color('[SPAM]', 'red'), color(sender.split('@')[0], 'lime'), 'in', color(gcName, 'lime'))
    }
    if (!isGc) {
        return console.log(color('[SPAM]', 'red'), color(sender.split('@')[0], 'lime'))
    }
}

function printLog(isCmd, sender, gcName, isGc) {
    if (isCmd && isGc) {
        return console.log(color('[EXEC]', 'aqua'), color(sender.split('@')[0], 'lime'), 'in', color(gcName, 'lime'))
    }
    if (isCmd && !isGc) {
        return console.log(color('[EXEC]', 'aqua'), color(sender.split('@')[0], 'lime'))
    }
}

module.exports = chatHandler = async (m, sock) => {
    if (m.type !== "notify") return;
    let msg = serialize(m, sock)
    if (!msg.message) return;
    if (msg.key && msg.key.remoteJid === "status@broadcast") return;
    if (msg.type === "protocolMessage" || msg.type === "senderKeyDistributionMessage" || !msg.type) return;

    let { body } = msg;
    let temp_pref = multi_pref.test(body) ? body.split('').shift() : '!';
    if (body === 'prefix' || body === 'cekprefix') {
        wa.reply(msg.from, `My prefix ${prefix}`, msg);
    }
    const { type, isGroup, sender, from } = msg;
    body =
        type === "conversation" && body?.startsWith(temp_pref)
            ? body : (type === "imageMessage" || type === "videoMessage") && body && body?.startsWith(temp_pref)
            ? body : type === "extendedTextMessage" && body?.startsWith(temp_pref)
            ? body : type === "buttonsResponseMessage" && body?.startsWith(temp_pref)
            ? body : type === "listResponseMessage" && body?.startsWith(temp_pref)
            ? body : type === "templateButtonReplyMessage" && body?.startsWith(temp_pref) ? body : '';
    const arg = body.substring(body.indexOf(' ') + 1);
    const args = body.trim().split(/ +/).slice(1);
    const isCmd = body.startsWith(temp_pref);
    const gcMeta = isGroup ? await sock.groupMetadata(from) : '';
    const gcName = isGroup ? gcMeta.subject : '';

    // Log
    printLog(isCmd, sender, gcName, isGroup);

    const cmdName = body.slice(temp_pref.length).trim().split(/ +/).shift().toLowerCase();
    const cmd = djs.commands.get(cmdName) || djs.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
    if (!cmd) return;

    if (!cooldown.has(from)) {
        cooldown.set(from, new djs.Collection());
    }
    const now = Date.now();
    const timestamps = cooldown.get(from);
    const cdAmount = (cmd.cooldown || 5) * 1000;
    if (timestamps.has(from)) {
        const expiration = timestamps.get(from) + cdAmount;

        if (now < expiration) {
            if (isGroup) {
                let timeLeft = (expiration - now) / 1000;
                printSpam(isGroup, sender, gcName);
                return await sock.sendMessage(from, { text: `This group is on cooldown, please wait another _${timeLeft.toFixed(1)} second(s)_` }, { quoted: msg })
            }
            else if (!isGroup) {
                let timeLeft = (expiration - now) / 1000;
                printSpam(isGroup, sender);
                return await sock.sendMessage(from, { text: `You are on cooldown, please wait another _${timeLeft.toFixed(1)} second(s)_` }, { quoted: msg })
            }
        }
    }
    timestamps.set(from, now);
    setTimeout(() => timestamps.delete(from), cdAmount);

    try {
        cmd.exec(msg, sock, args, arg);
    } catch(e) {
        console.error(e);
    }
}