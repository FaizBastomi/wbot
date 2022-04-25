module.exports = {
    name: 'bc',
    alias: ['broadcast'],
    category: 'private',
    async exec({ sock, args, isOwner }) {
        if (!isOwner) return;

        try {
            const chats = check4Duplicate(sock.store.chats.all().map(v => v.id));
            let text = `*Broadcast*\n\n${args.join(' ')}`;
            for (let id of chats) await sock.sendMessage(id, { text });
        } catch (e) {
            await msg.reply(e.stack);
        }
    }
}

const check4Duplicate = (chats) => {
    if (!Array.isArray(chats)) {
        return [];
    } else {
        let newChatIds = [];
        for (let id of chats) {
            !newChatIds.includes(id) && id !== 'status@broadcast' ? newChatIds.push(id) : ''
        }
        return newChatIds;
    }
}