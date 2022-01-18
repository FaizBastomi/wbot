const { default: WAConnection, DisconnectReason, useSingleFileAuthState, getBinaryNodeChild } = require("@adiwajshing/baileys-md")
const Pino = require("pino")
const { Boom } = require("@hapi/boom")
const djs = require("@discordjs/collection")
const fs = require("fs")
const { color } = require("./utils")
const { session } = require("./config.json")
const chatHandler = require("./event/chat_event")
const joinhandler = require("./event/group_event")

const { state, saveState } = useSingleFileAuthState(session, Pino({ level: "silent" }))
djs.commands = new djs.Collection()
djs.prefix = '!'

function readCmd() {
    let dir = fs.readdirSync('./command');
    dir.forEach(async (res) => {
        const commandFiles = fs.readdirSync(`./command/${res}`).filter((file) => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`./command/${res}/${file}`);
            djs.commands.set(command.name, command);
        }
    });
    console.log(color('[SYS]', 'yellow'), 'command loaded!');
}
readCmd();

function start() {
    const sock = WAConnection({
        printQRInTerminal: true,
        auth: state,
        logger: Pino({ level: "silent" }),
        browser: ["Windows", "Firefox", "96.0"]
    })
    // custom function
    sock.groupQueryInvite = async (code) => {
        const results = await sock.query({
            tag: 'iq',
            attrs: {
                type: "get",
                xmlns: "w:g2",
                to: "@g.us"
            }, content: [{ tag: "invite", attrs: { code } }]
        });
        const group = getBinaryNodeChild(results, "group");
        return group.attrs;
    }
    // creds.update
    sock.ev.on("creds.update", saveState)
    // connection.update
    sock.ev.on("connection.update", async (up) => {
        // console.log(up);
        const { lastDisconnect, connection } = up;
        if (connection) { console.log("Connection Status: ", connection); }
        let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        
        if (connection === "close") {
            if (reason === DisconnectReason.badSession) { console.log(`Bad Session File, Please Delete ${session} and Scan Again`); process.exit(); }
            else if (reason === DisconnectReason.connectionClosed) { console.log("Connection closed, reconnecting...."); start(); }
            else if (reason === DisconnectReason.connectionLost) { console.log("Connection Lost from Server, reconnecting..."); start(); }
            else if (reason === DisconnectReason.connectionReplaced) { console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); process.exit(); }
            else if (reason === DisconnectReason.loggedOut) { console.log(`Device Logged Out, Please Delete ${session} and Scan Again.`); process.exit(); }
            else if (reason === DisconnectReason.restartRequired) { console.log("Restart Required, Restarting..."); start(); }
            else if (reason === DisconnectReason.timedOut) { console.log("Connection TimedOut, Reconnecting..."); start(); }
            else { console.log(`Unknown DisconnectReason: ${reason}|${connection}`) }
        }
    })
    // messages.upsert
    sock.ev.on("messages.upsert", async (m) => {
        chatHandler(m, sock);
    })
    // group-participants.update
    sock.ev.on("group-participants.update", (json) => {
        joinhandler(json, sock);
    })
}

start()