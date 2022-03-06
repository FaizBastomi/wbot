const fs = require("fs");
const path = require("path").join;
let rootDir = path(__dirname, "H");
const nowYear = new Date().getFullYear();

/**
 * Input new data to json
 * @param {number} number User phone number
 * @param {Year} year User birth Year
 */
async function inputData(number, year) {
    if (!fs.existsSync(path(rootDir, "data.json"))) await fs.promises.writeFile(path(rootDir, "data.json"), "{}");
    let data = JSON.parse(fs.readFileSync(rootDir + "/data.json"));
    if (year > nowYear) return { status: 406, msg: "The user's year of birth cannot exceed the current year." }
    if (!data[number]) {
        data[number] = { year, old: nowYear - year };
        if (data[number]["old"] < 18) data[number]["eligible"] = false
        else data[number]["eligible"] = true
        fs.writeFileSync(rootDir + "/data.json", JSON.stringify(data, null, 2));
        return { status: 201, msg: "User data added successfully." }
    } else {
        return updateData(number, year, data);
    }
}

function updateData(number, year, currentData) {
    if (year > nowYear) return { status: 406, msg: "The user's year of birth cannot exceed the current year." }
    currentData[number] = { year, old: nowYear - year };
    if (currentData[number]["old"] < 18) currentData[number]["eligible"] = false
    else currentData[number]["eligible"] = true
    fs.writeFileSync(rootDir + "/data.json", JSON.stringify(currentData, null, 2));
    return { status: 200, msg: "User data has been modified successfully." }
}

function getData() {
    if (!fs.existsSync(path(rootDir, "data.json"))) {
        return "no_file"
    } else {
        return JSON.parse(fs.readFileSync(path(rootDir, "data.json")));
    }
}

module.exports = {
    inputData, getData
}