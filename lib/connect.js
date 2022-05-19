const {
	default: WASocket,
	DisconnectReason,
	useSingleFileAuthState,
	fetchLatestBaileysVersion,
} = require("@adiwajshing/baileys");
const Pino = require("pino");
const Users = require("../event/database/Premium");
const cron = require("node-cron");
const djs = require("./Collection");
const fs = require("fs");
const path = require("path").join;
const store = require("./store");
const moment = require("moment-timezone");
const { Boom } = require("@hapi/boom");
const { color } = require("../utils");
const chatHandler = require("../event/chat_event");
const joinHandler = require("../event/group_event");

if (!fs.existsSync("./config.json")) {
	throw Error("config file not found, please rename 'config.json.example' to 'config.json'");
}
const { session, chat_store, user_db, timezone, tier } = require("../config.json");
const { state, saveState } = useSingleFileAuthState(path(__dirname, `../${session}`), Pino({ level: "silent" }));
const user = new Users();
djs.commands = new djs.Collection();
djs.prefix = "!";

// prevent from crashing
// process.on("uncaughtException", console.error);

// store thing
async function readDB() {
	await Promise.all([store.readFromFile(chat_store), user.readFromFile(user_db)]);
}
readDB();

// cronjob thing
const task1 = cron.schedule(
	"*/7 * * * *",
	async () => {
		await Promise.all([store.writeToFile(chat_store), user.writeToFile(user_db)]);
	},
	{ scheduled: true, timezone }
);
task1.start();
const task2 = cron.schedule(
	"0 0 * * *",
	async () => {
		const allData = user.toArray();
		for (let data of allData) {
			data["limit"] = data.type ? tier[data.type] : 50;
			user.editUser(data.id, data);
		}
		await user.writeToFile(user_db);
		console.log(color("[CRON]", "yellow"), "Reset all limit");
	},
	{ scheduled: true, timezone }
);
task2.start();
const task3 = cron.schedule(
	"*/1 * * * *",
	() => {
		const allData = user.toArray();
		let expired = [];
		allData.forEach((data) => {
			if (data.premium) {
				if (Date.now() >= data.expire) {
					console.log(
						color("Premium Expired:", "yellow"),
						color(`'${data.id}'`, "lime"),
						"at",
						color(moment(data.expire).tz(timezone).format("lll"), "lime")
					);
					user.deletePremium(data.id);
					expired.push(data.id);
				}
			}
		});
		if (expired.length > 0) {
			user.writeToFile(user_db);
		}
	},
	{ scheduled: true, timezone }
);
task3.start();

// command
function readCommand() {
	let $rootDir = path(__dirname, "../command");
	let dir = fs.readdirSync($rootDir);
	let tierSum = Object.keys(tier).length;

	dir.forEach(($dir) => {
		const commandFiles = fs.readdirSync(path($rootDir, $dir)).filter((file) => file.endsWith(".js"));
		for (let file of commandFiles) {
			const command = require(path($rootDir, $dir, file));
			if (command?.premium) {
				if (command?.premiumType?.length === tierSum) {
					command.premiumType = Object.keys(tier);
				} else {
					command.premiumType = Object.keys(tier).slice(1);
				}
			}
			djs.commands.set(command.name, command);
		}
	});
	console.log(color("[SYS]", "yellow"), "command loaded!");
}
readCommand();

const connect = async () => {
	let { version, isLatest } = await fetchLatestBaileysVersion();
	console.log(`Using: ${version}, newer: ${isLatest}`);
	const sock = WASocket({
		printQRInTerminal: true,
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
		const { lastDisconnect, connection } = up;
		if (connection) {
			console.log("Connection Status: ", connection);
		}

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
