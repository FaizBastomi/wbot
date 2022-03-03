const axios = require('axios').default
const cheerio = require("cheerio")
const FormData = require("form-data")
const { UserAgent } = require("./index")
const Util = require('util')
const API_GUEST = 'https://api.twitter.com/1.1/guest/activate.json'
const API_TIMELINE = 'https://api.twitter.com/2/timeline/conversation/%s.json?tweet_mode=extended'
const AUTH = 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'

const igdl = require("./instagram")
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

class Downloader extends igdl {
    /**
     * Download from Twitter
     * @param {String} url Twitter URL
     */
    async getInfo(url) {
        const id = getID(url)
        if (id) {
            let token
            try {
                const response = await getToken()
                token = response.guest_token
            } catch (e) {
                throw new Error(e)
            }
            const response = await axios.get(Util.format(API_TIMELINE, id), {
                headers: {
                    'x-guest-token': token,
                    'authorization': AUTH
                }
            })
            if (!response.data['globalObjects']['tweets'][id]['extended_entities']) throw new Error('No media')
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
    /**
     * Download from Facebook
     * @param {String} url Facebook post
     */
    async fbdl(url) {
        let token, result, agent = UserAgent();
        try {
            // get token
            token = await axios.get("https://downvideo.net", {
                headers: {
                    "accept": `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
                    "accept-language": `id,en-US;q=0.9,en;q=0.8,es;q=0.7,ms;q=0.6`,
                    "sec-fetch-user": `?1`,
                    "User-Agent": agent
                }
            });
            const $token = cheerio.load(token.data);
            token = $token('input[name="token"]').attr('value') ?? null;
            // post data
            result = await axios.post("https://downvideo.net/download.php", new URLSearchParams(
                Object.entries({ "URL": url, token })
            ), {
                headers: {
                    "accept": `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
                    "accept-language": `id,en-US;q=0.9,en;q=0.8,es;q=0.7,ms;q=0.6`,
                    "sec-fetch-user": `?1`,
                    "content-type": `application/x-www-form-urlencoded`,
                    "User-Agent": agent
                }
            });
            const $rootDl = cheerio.load(result.data);
            result = [];
            $rootDl('div[class="col-md-10"]').find('a').each((a, b) => {
                let dl = $rootDl(b).attr("href")
                let rex = /(?:https:?\/{2})?(?:[a-zA-Z0-9])\.xx\.fbcdn\.net/
                if (rex.test(dl)) {
                    result.push(dl);
                }
            });
        } catch (e) {
            throw e.message;
        } finally {
            return result;
        }
    }
}

module.exports = Downloader;