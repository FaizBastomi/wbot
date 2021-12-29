const axios = require('axios').default
const cheerio = require("cheerio")
const { UserAgent } = require("./index")
const Util = require('util')
const API_GUEST = 'https://api.twitter.com/1.1/guest/activate.json'
const API_TIMELINE = 'https://api.twitter.com/2/timeline/conversation/%s.json?tweet_mode=extended'
const AUTH = 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'

/**
 * Get Twitter ID
 * 
 * @param {String} url Twitter URL
 * @returns {String} Twitter ID
 */
 const getID = (url) => {
    let regex = /twitter\.com\/[^/]+\/status\/(\d+)/
    let matches = regex.exec(url)
    return matches && matches[1]
}

/**
 * Get Twitter Info
 * 
 * @param {String} url Twitter URL
 */
const getInfo = async function (url) {
    const id = getID(url)
    if (id) {
        let token
        try {
            const response = await getToken()
            token = response.guest_token
        } catch (e) {
            throw new Error(e)
        }
        const response = await axios.get(Util.format(API_TIMELINE, id),{
            headers: {
                'x-guest-token': token,
                'authorization': AUTH
            }
        })
        if(!response.data['globalObjects']['tweets'][id]['extended_entities']) throw new Error('No media')
        const media = response.data['globalObjects']['tweets'][id]['extended_entities']['media']
        if (media[0].type === 'video') return {
            type: media[0].type,
            full_text: response.data['globalObjects']['tweets'][id]['full_text'],
            variants: media[0]['video_info']['variants']
        }
        if (media[0].type === 'photo') return {
            type: media[0].type,
            full_text: response.data['globalObjects']['tweets'][id]['full_text'],
            variants: media.map((x) => x.media_url_https)
        }
        if (media[0].type === 'animated_gif') return {
            type: media[0].type,
            full_text: response.data['globalObjects']['tweets'][id]['full_text'],
            variants: media[0]['video_info']['variants']
        }
    } else {
        throw new Error('Not a Twitter URL')
    }
}

async function getToken() {
    try {
        const response = await axios.post(API_GUEST, null, {
            headers: {
                'authorization': AUTH
            }
        })
        if (response.status === 200 && response.data) {
            return response.data
        }
    } catch (e) {
        throw new Error(e)
    }
}

const fbdl = async (url) => {
    // Get token from Downvideo.net
    async function getToken() {
        let ua = UserAgent();
        const response = await axios.get("https://downvideo.net", {
            headers: {
                "accept": `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
                "accept-language": `id,en-US;q=0.9,en;q=0.8,es;q=0.7,ms;q=0.6`,
                "sec-fetch-user": `?1`,
                "User-Agent": ua
            }
        })
        // Parse HTML and search token
        const $ = cheerio.load(response.data)
        let token;
        $('div[class="input-group col-lg-9"]').find('input').each((a, b) => {
            let tok = $(b).attr('value')
            if (tok) { token = tok }
        })
        return { ua, token };
    }
    
    // Post to Downvideo.net
    async function post(metadata, ua) {
        const response = await axios({
            url: "https://downvideo.net/download.php",
            method: "POST",
            data: new URLSearchParams(Object.entries(metadata)),
            headers: {
                "accept": `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
                "accept-language": `id,en-US;q=0.9,en;q=0.8,es;q=0.7,ms;q=0.6`,
                "sec-fetch-user": `?1`,
                "content-type": `application/x-www-form-urlencoded`,
                "User-Agent": ua
            }
        })
        // Parse HTML and search for download link
        const $ = cheerio.load(response.data)
        let dl_link = [];
        $('div[class="col-md-10"]').find('a').each((a, b) => {
            let dl = $(b).attr("href")
            let rex = /(?:https:?\/{2})?(?:[a-zA-Z0-9])\.xx\.fbcdn\.net/
            if (rex.test(dl)) {
                dl_link.push(dl)
            }
        })
        return dl_link
    }

    // Proccesing request
    const meta = await getToken();
    let data = { "URL": url, "token": meta.token }
    const response = await post(data, meta.ua)
    return response;
}

module.exports = {
    getInfo,
    fbdl
}