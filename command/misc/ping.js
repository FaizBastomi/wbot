const { calculatePing } = require('../../utils')

module.exports = {
    name: 'ping',
    category: 'misc',
    desc: 'Bot response in second.',
    async exec(msg, sock) {
        await sock.sendMessage(msg.from, { text: `*_${calculatePing(msg.messageTimestamp, Date.now())} second(s)_*` }, { quoted: msg })
    }
}