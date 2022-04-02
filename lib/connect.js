const { default: WASocket, DisconnectReason, useSingleFileAuthState, fetchLatestBaileysVersion } = require("@adiwajshing/baileys");
const Pino = require("pino");
const djs = require("@discordjs/collection");
const fs = require("fs");
const path = require("path").join;
const { Boom } = require("@hapi/boom");
const { color } = require("../utils");
const { session } = require("../config.json");
const chatHandler = require("../event/chat_event");
const joinHandler = require("../event/group_event");

const { state, saveState } = useSingleFileAuthState(path(__dirname, `../${session}`), Pino({ level: "silent" }));
djs.commands = new djs.Collection();
djs.prefix = '!';

const readCommand = ()=> {
    let rootDir = path(__dirname, "../command");
    let dir = fs.readdirSync(rootDir);
    dir.forEach(async (res) => {
        const commandFiles = fs.readdirSync(`${rootDir}/${res}`).filter((file) => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`${rootDir}/${res}/${file}`);
            djs.commands.set(command.name, command);
        }
    });
    console.log(color('[SYS]', 'yellow'), 'command loaded!');
}
// cmd
readCommand()

const connect = async () => {
    let { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Using: ${version}, newer: ${isLatest}`)
    const sock = WASocket({
        printQRInTerminal: true,
        auth: state,
        logger: Pino({ level: "silent" }),
        version
    })

    // creds.update
    sock.ev.on("creds.update", saveState)
    // connection.update
    sock.ev.on("connection.update", async (up) => {
        // console.log(up);
        const { lastDisconnect, connection } = up;
        if (connection) { console.log("Connection Status: ", connection); }

        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (reason === DisconnectReason.badSession) { console.log(`Bad Session File, Please Delete ${session} and Scan Again`); sock.logout(); }
            else if (reason === DisconnectReason.connectionClosed) { console.log("Connection closed, reconnecting...."); connect(); }
            else if (reason === DisconnectReason.connectionLost) { console.log("Connection Lost from Server, reconnecting..."); connect(); }
            else if (reason === DisconnectReason.connectionReplaced) { console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); sock.logout(); }
            else if (reason === DisconnectReason.loggedOut) { console.log(`Device Logged Out, Please Delete ${session} and Scan Again.`); sock.logout(); }
            else if (reason === DisconnectReason.restartRequired) { console.log("Restart Required, Restarting..."); connect(); }
            else if (reason === DisconnectReason.timedOut) { console.log("Connection TimedOut, Reconnecting..."); connect(); }
            else { sock.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`) }
        }
    })
    // messages.upsert
    sock.ev.on("messages.upsert", async (m) => {
        chatHandler(m, sock);
    })
    // group-participants.update
    sock.ev.on("group-participants.update", (json) => {
        joinHandler(json, sock);
    })
}
connect()