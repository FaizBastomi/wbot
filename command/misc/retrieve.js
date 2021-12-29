const { proto, generateWAMessageFromContent, generateMessageID } = require('@adiwajshing/baileys-md');

module.exports = {
    name: 'retrieve',
    alias: ['rvo'],
    category: 'misc',
    desc: 'Retrieve viewOnceMessage.',
    async exec(msg, sock) {
        const { quoted, from } = msg;
        if (quoted) {
            if (quoted.type === 'view_once') {
                const mtype = Object.keys(quoted.message)[0];
                delete quoted.message[mtype].viewOnce;
                const msgs = proto.Message.fromObject({
                    ...quoted.message
                })
                const prep = generateWAMessageFromContent(from, msgs, { quoted: msg })
                await sock.relayMessage(from, prep.message, { messageId: generateMessageID() });
            } else {
                await sock.sendMessage(from, { text: 'please, reply to viewOnceMessage' }, { quoted: msg });
            }
        } else {
            await sock.sendMessage(from, { text: 'please, reply to viewOnceMessage' }, { quoted: msg });
        }
    },
};
