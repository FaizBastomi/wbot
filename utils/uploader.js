const axios = require("axios").default;
const cheerio = require("cheerio");
const BodyForm = require("form-data");
const { createReadStream } = require("fs");

const webp2mp4 = (path) => {
    return new Promise((resolve, reject) => {
        const form = new BodyForm();
        form.append("new-image-url", "");
        form.append("new-image", createReadStream(path));
        console.log('Upload new file to ezgif...');
        axios({
            method: "post",
            url: "https://s6.ezgif.com/webp-to-mp4",
            data: form,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${form._boundary}`
            }
        }).then(({ data }) => {
            const bodyFormThen = new BodyForm();
            const $ = cheerio.load(data);
            const file = $('input[name="file"]').attr('value')
            const token = $('input[name="token"]').attr('value')
            const convert = $('input[name="file"]').attr('value')
            bodyFormThen.append("file", file);
            bodyFormThen.append("token", token);
            bodyFormThen.append("convert", convert);
            console.log('Start converting...');
            axios({
                method: "post",
                url: "https://ezgif.com/webp-to-mp4/" + file,
                data: bodyFormThen,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${bodyFormThen._boundary}`
                }
            }).then(({ data }) => {
                const $ = cheerio.load(data);
                let result = 'https:' + $('div#output > p.outfile > video > source').attr('src')
                resolve(result);
                console.log('Success converting');
            }).catch(reject);
        }).catch(reject);
    })
}

module.exports = {
    webp2mp4
}