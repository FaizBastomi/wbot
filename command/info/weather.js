const { openWeatherAPI } = require("../../utils")

module.exports = {
    name: "cuaca",
    alias: ["weather"],
    desc: "Weather Report/Laporan Cuaca",
    use: "<city>\nEx: !weather jakarta",
    category: "information",
    async exec(msg, sock, args) {
        const { from, quoted } = msg
        if (!quoted?.message?.locationMessage && !quoted?.message?.liveLocationMessage && !args.length > 0) return await sock.sendMessage(from, { text: "Please, input city name\nEx:\n*#weather Bengkulu* or reply to location message" }, { quoted: msg });

        // Proccecsing
        try {
            if (quoted?.message?.locationMessage) {
                let geo = quoted?.message?.locationMessage?.degreesLatitude + "|" + quoted?.message?.locationMessage?.degreesLongitude
                let info = await openWeatherAPI(geo, "geo")
                if (info.status !== 200) return await sock.sendMessage(from, { text: info.msg }, { quoted: msg });
                else {
                    let text = `☁️ Weather Report ☁️\n> ${info.name}\n\n`
                        + `\`\`\`Deskripsi/Desc: ${info.desc}\nSuhu/Temp: ${info.temp}\nTerasa/Feels like: ${info.feels}\nTekanan/Pressure: ${info.press}\nKelembaban/Humidity: ${info.humi}\n`
                        + `Jarak Pandang/Visibility: ${info.visible}\nKecepatan Angin/Wind Speed: ${info.wind}\`\`\``
                        + `\n\n*Powered by* openweathermap.org\nMore https://openweathermap.org/city/${info.id}`
                    await sock.sendMessage(from, { text }, { quoted: msg });
                }
            } else if (quoted?.message?.liveLocationMessage) {
                let geo = quoted?.message?.liveLocationMessage?.degreesLatitude + "|" + quoted?.message?.liveLocationMessage?.degreesLongitude
                let info = await openWeatherAPI(geo, "geo")
                if (info.status !== 200) return await sock.sendMessage(from, { text: info.msg }, { quoted: msg });
                else {
                    let text = `☁️ Weather Report ☁️\n> ${info.name}\n\n`
                        + `\`\`\`Deskripsi/Desc: ${info.desc}\nSuhu/Temp: ${info.temp}\nTerasa/Feels like: ${info.feels}\nTekanan/Pressure: ${info.press}\nKelembaban/Humidity: ${info.humi}\n`
                        + `Jarak Pandang/Visibility: ${info.visible}\nKecepatan Angin/Wind Speed: ${info.wind}\`\`\``
                        + `\n\n*Powered by* openweathermap.org\nMore https://openweathermap.org/city/${info.id}`
                    await sock.sendMessage(from, { text }, { quoted: msg });
                }
            } else {
                let info = await openWeatherAPI(args.join(" "), "city")
                if (info.status !== 200) return await sock.sendMessage(from, { text: info.msg }, { quoted: msg });
                else {
                    let text = `☁️ Weather Report ☁️\n> ${info.name}\n\n`
                        + `\`\`\`Deskripsi/Desc: ${info.desc}\nSuhu/Temp: ${info.temp}\nTerasa/Feels like: ${info.feels}\nTekanan/Pressure: ${info.press}\nKelembaban/Humidity: ${info.humi}\n`
                        + `Jarak Pandang/Visibility: ${info.visible}\nKecepatan Angin/Wind Speed: ${info.wind}\`\`\``
                        + `\n\n*Powered by* openweathermap.org\nMore https://openweathermap.org/city/${info.id}`
                    await sock.sendMessage(from, { text }, { quoted: msg });
                }
            }
        } catch {
            await sock.sendMessage(from, { text: "Something bad happend" })
        }
    }
}