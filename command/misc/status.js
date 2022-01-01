const os = require('os');
const { formatSize } = require("../../utils");

module.exports = {
    name: 'stats',
    alias: ['status'],
    category: 'misc',
    desc: 'Bot Stats',
    async exec(msg, sock) {
        let text = ''
        text += `HOST:\n- Arch: ${os.arch()}\n- CPU: ${os.cpus()[0].model}${os.cpus().length > 1 ? (' (' + os.cpus().length + 'x)') : ''}\n- Release: ${os.release()}\n- Version: ${os.version()}\n`
        text += `- Memory: ${formatSize(os.totalmem() - os.freemem())} / ${formatSize(os.totalmem())}\n`
        text += `- Platform: ${os.platform()}`;
        await msg.reply(text);
    }
}