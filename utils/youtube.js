const ytsr = require('ytsr')
const { default: axios } = require("axios")
const { UserAgent } = require("./index")
/*
const { ytCookie } = require('../config.json')

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
} */

const search = async function (query, type) {
    if (!type) {
        throw Error(`Filter need to be specified.`)
    }
    const fi = await ytsr.getFilters(query)
    const fi_1 = fi.get('Type').get('Video')
    let final
    switch (type) {
        case 'short': {
            const fi_2 = await ytsr.getFilters(fi_1.url)
            const fi_3 = fi_2.get('Duration').get('Under 4 minutes')
            final = await ytsr(fi_3.url, { limit: 20 })
            break;
        }
        case 'long': {
            final = await ytsr(fi_1.url, { limit: 20 })
            break;
        }
    }
    return final.items
}

const yta = async function (url) {
    const UA = UserAgent()
    const post = (formdata, url, ua) => {
        return axios({
            method: "post",
            url,
            data: new URLSearchParams(Object.entries(formdata)),
            headers: {
                "USer-Agent": ua,
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            }
        })
    }
    const res = await post({ q: url, vt: "mp3" }, "https://yt1s.com/api/ajaxSearch/index", UA)
    if (res.data.status !== "ok") throw Error("Error Occurs when posting data to yt1s server.\n", res.data)
    const res2 = await post({ vid: res.data.vid, k: res.data.links.mp3.mp3128.k }, "https://yt1s.com/api/ajaxConvert/convert", UA)
    if (res2.data.status !== "ok") throw Error("Error occurs when posting 'convert' data to yt1s server.\n", res.data)

    let title = res.data.title,
        filesizeF = res.data.links.mp3.mp3128.size,
        filesize = parseFloat(filesizeF) * (1000 * /MB$/.test(filesizeF)),
        id = res.data.vid,
        thumb = `https://i.ytimg.com/vi/${id}/0.jpg`,
        dl_link = res2.data.dlink,
        q = res.data.links.mp3.mp3128.q

    return { title, filesize, filesizeF, id, thumb, dl_link, q }
}

const ytv = async function (url) {
    const UA = UserAgent()
    const post = (formdata, url, ua) => {
        return axios({
            method: "post",
            url,
            data: new URLSearchParams(Object.entries(formdata)),
            headers: {
                "USer-Agent": ua,
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            }
        })
    }
    const res = await post({ q: url, vt: "mp4" }, "https://yt1s.com/api/ajaxSearch/index", UA)
    if (res.data.status !== "ok") throw Error("Error Occurs when posting data to yt1s server.\n", res.data)
    const res2 = await post({ vid: res.data.vid, k: res.data.links.mp4["18"].k }, "https://yt1s.com/api/ajaxConvert/convert", UA)
    if (res2.data.status !== "ok") throw Error("Error occurs when posting 'convert' data to yt1s server.\n", res.data)

    let title = res.data.title,
        filesizeF = res.data.links.mp4["18"].size,
        filesize = parseFloat(filesizeF) * (1000 * /MB$/.test(filesizeF)),
        id = res.data.vid,
        thumb = `https://i.ytimg.com/vi/${id}/0.jpg`,
        dl_link = res2.data.dlink,
        q = res.data.links.mp4["18"].q

    return { title, filesize, filesizeF, id, thumb, dl_link, q }
}

module.exports = {
    search,
    yta,
    ytv
}