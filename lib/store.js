/**
 * Custom memoryStore
 * Source @adiwajshing/baileys/src/Store
 */
const { default: KeyedDB } = require('@adiwajshing/keyed-db');
const { writeFileSync, existsSync, readFileSync } = require('fs');
const waChatKey = (pin) => ({
    key: (c) => (pin ? (c.pin ? '1' : '0') : '') + (c.archive ? '0' : '1') + (c.conversationTimestamp ? c.conversationTimestamp.toString(16).padStart(8, '0') : '') + c.id,
    compare: (k1, k2) => k2.localeCompare(k1)
})
let chatKey = waChatKey(true);

const contacts = {};
const chats = new KeyedDB(chatKey, c => c.id);

const contactsUpsert = (newContacts) => {
    const oldContacts = new Set(Object.keys(contacts));
    for (const contact of newContacts) {
        oldContacts.delete(contact.id);
        contacts[contact.id] = Object.assign(
            contacts[contact.id] || {},
            contact
        )
    }
    return oldContacts;
}

const toJSON = () => ({
    chats,
    contacts
})

const fromJSON = (json) => {
    chats.upsert(...json.chats);
    contactsUpsert(Object.values(json.contacts));
}

const bind = (ev) => {
    ev.on('chats.set', ({ chats: newChats, isLatest }) => {
        if (isLatest) {
            chats.clear();
        }
        const chatsAdded = chats.insertIfAbsent(...newChats).length;
        console.log(chatsAdded, 'synced chats');
    })
    ev.on('chats.upsert', newChats => {
        chats.upsert(...newChats)
    })
    ev.on('chats.update', updates => {
        for (let update of updates) {
            const result = chats.update(update.id, chat => {
                if (update.unreadCount > 0) {
                    update = { ...update }
                    update.unreadCount = chat.unreadCount + update.unreadCount
                }

                Object.assign(chat, update)
            })
            if (!result) {
                // console.log('got update for non-existant chat')
            }
        }
    })
    ev.on('contacts.set', ({ contacts: newContacts }) => {
        const oldContacts = contactsUpsert(newContacts)
        for (const jid of oldContacts) {
            delete contacts[jid]
        }
    })
    ev.on('contacts.update', updates => {
        for (const update of updates) {
            if (contacts[update.id]) {
                Object.assign(contacts[update.id], update)
            } else {
                // 
            }
        }
    })
}
function writeToFile (path) {
    writeFileSync(path, JSON.stringify(toJSON(), null, '\t'));
    console.log('writed store to: ', path);
}
function readFromFile (path) {
    if(existsSync(path)) {
        console.log('read store from: ', path);
        const jsonStr = readFileSync(path, { encoding: 'utf-8' });
        const json = JSON.parse(jsonStr);
        fromJSON(json);
    }
}

module.exports = { chats, contacts, bind, writeToFile, readFromFile }