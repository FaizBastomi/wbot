/**
 * Custom memoryStore
 * Source @adiwajshing/baileys/src/Store
 */
const { default: KeyedDB } = require("@adiwajshing/keyed-db");
const { existsSync, promises } = require("fs");
const { join } = require("path");
const waChatKey = (pin) => ({
	key: (c) =>
		(pin ? (c.pin ? "1" : "0") : "") +
		(c.archive ? "0" : "1") +
		(c.conversationTimestamp ? c.conversationTimestamp.toString(16).padStart(8, "0") : "") +
		c.id,
	compare: (k1, k2) => k2.localeCompare(k1),
});
let chatKey = waChatKey(true);

const chats = new KeyedDB(chatKey, (c) => c.id);

const toJSON = () => ({
	chats,
});

const fromJSON = (json) => {
	chats.upsert(...json.chats);
};

const bind = (ev) => {
	ev.on("chats.set", ({ chats: newChats, isLatest }) => {
		if (isLatest) {
			chats.clear();
		}
		const chatsAdded = chats.insertIfAbsent(...newChats).length;
		console.log(chatsAdded, "synced chats");
	});
	ev.on("chats.upsert", (newChats) => {
		chats.upsert(...newChats);
	});
	ev.on("chats.update", (updates) => {
		for (let update of updates) {
			const result = chats.update(update.id, (chat) => {
				if (update.unreadCount > 0) {
					update = { ...update };
					update.unreadCount = chat.unreadCount + update.unreadCount;
				}

				Object.assign(chat, update);
			});
			if (!result) {
				// console.log('got update for non-existant chat')
			}
		}
	});
	ev.on("chats.delete", (deletions) => {
		for (const item of deletions) {
			chats.deleteById(item);
		}
	});
};
async function writeToFile(filename) {
	let $path = join(__dirname, filename ? filename : "baileys-store.json");
	await promises.writeFile($path, JSON.stringify(toJSON(), null, "\t"));
	console.log("write store to: ", $path);
}
async function readFromFile(filename) {
	let $path = join(__dirname, filename ? filename : "baileys-store.json");
	if (existsSync($path)) {
		console.log("read store from: ", $path);
		const jsonStr = await promises.readFile($path, { encoding: "utf-8" });
		const json = JSON.parse(jsonStr);
		fromJSON(json);
	}
}

module.exports = { chats, bind, writeToFile, readFromFile };
