const {
	default: WASocket,
	DisconnectReason,
	useSingleFileAuthState,
	fetchLatestBaileysVersion,
} = require("@adiwajshing/baileys");
const Pino = require("pino");
const cron = require("node-cron");
const qrcode = require("qrcode");
const express = require("express");
const Users = require("../event/database/Users");
const djs = require("./Collection");
const fs = require("fs");
const path = require("path").join;
const store = require("./store");
const { Boom } = require("@hapi/boom");
const { color } = require("../utils");
const { session, user_db } = process.env;
const chatHandler = require("../event/chat_event");
const joinHandler = require("../event/group_event");

// Server
const PORT = process.env.PORT || 3000
const app = express()
let QR_GENERATE = "invalid";

const { state, saveState } = useSingleFileAuthState(path(__dirname, `../${session}`), Pino({ level: "silent" }));
const user = new Users();
djs.commands = new djs.Collection();
djs.prefix = "!";

// prevent from crashing
process.on("uncaughtException", console.error);

// store thing
store.readFromFile(path(__dirname, "baileys-store.json"));
user.readFromFile(`./event/database/users/${user_db}`);

// cronjob thing
const task1 = cron.schedule(
	"*/7 * * * *",
	() => {
		store.writeToFile(path(__dirname, "baileys-store.json"));
		user.writeToFile(`./event/database/users/${user_db}`);
	},
	{ scheduled: true, timezone: "Asia/Jakarta" }
);
task1.start();
const task2 = cron.schedule(
	"0 0 * * *",
	() => {
		const allData = user.toArray();
		let limitMap = {
			basic: 200,
			support: 500,
			vip: 999,
		};
		for (let data of allData) {
			data["limit"] = data.type ? limitMap[data.type] : 50;
			user.editUser(data.id, data);
		}
		user.writeToFile(`./event/database/users/${user_db}`);
		console.log("[CRON] Reset all limit");
	},
	{ scheduled: true, timezone: "Asia/Jakarta" }
);
task2.start();

const readCommand = () => {
	let $rootDir = path(__dirname, "../command");
	let dir = fs.readdirSync($rootDir);
	dir.forEach(($dir) => {
		const commandFiles = fs.readdirSync(path($rootDir, $dir)).filter((file) => file.endsWith(".js"));
		for (let file of commandFiles) {
			const command = require(path($rootDir, $dir, file));
			djs.commands.set(command.name, command);
		}
	});
	console.log(color("[SYS]", "yellow"), "command loaded!");
};
// cmd
readCommand();

const connect = async () => {
	let { version, isLatest } = await fetchLatestBaileysVersion();
	console.log(`Using: ${version}, newer: ${isLatest}`);
	const sock = WASocket({
		printQRInTerminal: false, // Scan from server
		auth: state,
		logger: Pino({ level: "silent" }),
		version,
	});
	store.bind(sock.ev);
	sock.chats = store.chats;

	// creds.update
	sock.ev.on("creds.update", saveState);
	// connection.update
	sock.ev.on("connection.update", async (up) => {
		// console.log(up);
		const { lastDisconnect, connection, qr } = up;
		if (connection) {
			console.log("Connection Status: ", connection);
		}

		if (qr) { QR_GENERATE = qr; }

		if (connection === "close") {
			let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
			if (reason === DisconnectReason.badSession) {
				console.log(`Bad Session File, Please Delete ${session} and Scan Again`);
				sock.logout();
			} else if (reason === DisconnectReason.connectionClosed) {
				console.log("Connection closed, reconnecting....");
				connect();
			} else if (reason === DisconnectReason.connectionLost) {
				console.log("Connection Lost from Server, reconnecting...");
				connect();
			} else if (reason === DisconnectReason.connectionReplaced) {
				console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
				sock.logout();
			} else if (reason === DisconnectReason.loggedOut) {
				console.log(`Device Logged Out, Please Delete ${session} and Scan Again.`);
				sock.logout();
			} else if (reason === DisconnectReason.restartRequired) {
				console.log("Restart Required, Restarting...");
				connect();
			} else if (reason === DisconnectReason.timedOut) {
				console.log("Connection TimedOut, Reconnecting...");
				connect();
			} else {
				sock.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`);
			}
		}
	});
	// messages.upsert
	sock.ev.on("messages.upsert", async (m) => {
		chatHandler(m, sock);
	});
	// group-participants.update
	sock.ev.on("group-participants.update", (json) => {
		joinHandler(json, sock);
	});
};
connect();


// Server
app.use(async(req, res) => {
	res.setHeader("content-type", "image/png")
	res.end(await qrcode.toBuffer(QR_GENERATE))
})

app.listen(PORT, () => { console.log(`Server running on PORT ${PORT}`); })