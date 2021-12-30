const axios = require("axios").default;
const cheerio = require("cheerio");
const BodyForm = require("form-data");
const { fromBuffer } = require("file-type");
const { fetchBuffer } = require("./index");
const { createReadStream, writeFile, unlinkSync } = require("fs");

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

/**
 * Upload to Telegra.ph
 * @param {Buffer} fileData 
 * @returns {Promise<URL|string>}
 */
const upTgph = (fileData) => {
    return new Promise(async (resolve, reject) => {
        const { ext } = await fromBuffer(fileData);
        const filePath = 'utils/tmp.' + ext;
        writeFile(filePath, fileData, async (err) => {
            if (err) unlinkSync(filePath) && reject(err);
            console.log('Uploading to telegra.ph...')
            const form = new BodyForm();
            form.append('file', createReadStream(filePath));
            const { data } = await axios({ url: "https://telegra.ph/upload", data: form, method: "post", responseType: "json", headers: { ...form.getHeaders() } }).catch(reject);
            if (data.error) unlinkSync(filePath) && reject(data.error);
            console.log('Success');
            resolve('https://telegra.ph' + data[0].src);
            unlinkSync(filePath);
        })
    })
}

/**
 * memeText -- add text to image
 * @param {Buffer} imageData 
 * @param {string} top 
 * @param {string} bottom 
 * @returns {Promise<Buffer>}
 */
const memeText = (imageData, top, bottom) => new Promise(async (resolve, reject) => {
    if (!imageData) reject('No imageData');
    const imageUrl = await upTgph(imageData).catch(reject);
    let topText = top.trim().replace(/\s/g, '_').replace(/\?/g, '~q').replace(/\%/g, '~p').replace(/\#/g, '~h').replace(/\//g, '~s');
    let bottomText = bottom.trim().replace(/\s/g, '_').replace(/\?/g, '~q').replace(/\%/g, '~p').replace(/\#/g, '~h').replace(/\//g, '~s');

    let result = `https://api.memegen.link/images/custom/${topText}/${bottomText}.png?background=${imageUrl}`;
    const binResult = await fetchBuffer(result);
    resolve(binResult);
})
module.exports = {
    webp2mp4,
    upTgph,
    memeText
}