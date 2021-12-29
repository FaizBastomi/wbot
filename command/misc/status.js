const os = require('os');

module.exports = {
    name: 'stats',
    alias: ['status'],
    category: 'misc',
    desc: 'Bot Stats',
    async exec(msg, sock) {
        let text = ''
        text += `HOST:\n- Arch: ${os.arch()}\n- CPU: ${os.cpus()[0].model}${os.cpus().length > 1 ? (' (' + os.cpus().length + 'x)') : ''}\n- Release: ${os.release()}\n- Version: ${os.version()}\n`
        text += `- Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / ${Math.round(os.totalmem / 1024 / 1024).toFixed(2)}MB\n`
        text += `- Platform: ${os.platform()}\n\n`;
        await sock.sendMessage(msg.from, { text }, { quoted: msg });
    }
}