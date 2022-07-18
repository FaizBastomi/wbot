const { fetchJson } = require('../../utils')
const { unsplashAccessKey } = require('../../config.json')

module.exports = {
    name: 'unsplash',
    alias: ['uns'],
    desc: "Search image from unsplash.com",
	use: "<query>",
	category: "random",
	limit: true,
	consume: 2,
    async exec({ sock, args, msg}) {
        if(args.length < 1) return await msg.reply('enter query')
        await msg.reply('Wait...')
        try {
            const res = await fetchJson(`https://api.unsplash.com/search/photos?query=${args.join(' ')}&client_id=${unsplashAccessKey}`) // get access key from https://unsplash.com/developers
            if(!res.total) return await msg.reply('Image not found')
            const data = res.results[Math.floor(Math.random() * res.results.length)]
            await sock.sendMessage(msg.from, {
                image: { url: data?.urls?.full ? data?.urls?.full : data?.urls?.regular },
                templateButtons: [
                    { quickReplyButton: { displayText: "➡️ Next", id: `#unsplash ${args.join(' ')}` } },
                ]
            })
        } catch(e) {
            await msg.reply('There is an error')
            console.log(e);
        }
    }
}