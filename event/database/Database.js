/**
 * Author https://github.com/Rizky878
 * source https://github.com/Rizky878/rzky-multidevice/blob/main/lib/Database.js
 * Modified to my need
 */
const { existsSync, statSync, writeFileSync, renameSync, unlinkSync } = require("fs");
const { formatSize } = require("../../utils");
const { join, basename } = require("path");
const moment = require("moment-timezone");
const $rootDir = join(__dirname, "users");

class Database {
	constructor() {}
	addDatabase(name = "database") {
		if (existsSync(join($rootDir, name + ".json"))) return `File '${name}' already exists`;
		try {
			writeFileSync(join($rootDir, name + ".json"), "[]");
			return `Writing file "${name}" success`;
		} catch (err) {
			console.error(err);
			return "Error writing file\n" + err;
		}
	}
	rename(name = "database", setName) {
		if (!setName || typeof setName !== "string") {
			return TypeError(`'setName' is ${typeof setName}. 'setName' must be a string`);
		}
		if (!existsSync(join($rootDir, name + ".json"))) {
			return Error(`'${name}' file not found, create Database file first`);
		}
		if (existsSync(join($rootDir, setName + ".json"))) {
			return Error(`'${setName}' file already exists`);
		}
		try {
			renameSync(join($rootDir, name + ".json"), join($rootDir, setName + ".json"));
			return `Success renamed filename '${name} -> ${setName}'`;
		} catch (e) {
			return e;
		}
	}
	deleteDatabase(name) {
		if (!name || typeof name !== "string") {
			return TypeError(`'name' is ${typeof name}. 'name' must be a string`);
		}
		if (!existsSync(join($rootDir, name + ".json"))) {
			return Error(`'${name}' not found, please create Database first`);
		}
		try {
			unlinkSync(join($rootDir, name + ".json"));
			return `successfully delete file "${name}"`;
		} catch (err) {
			return `error delete file\n` + err;
		}
	}
	statDatabase(name) {
		if (!name) return "empty name";
		if (!existsSync(join($rootDir, name + ".json"))) return `'${name}' file not found, please addDatabase first`;
		try {
			let stat = statSync(join($rootDir, name + ".json"));
			return {
				filename: basename(join($rootDir, name + ".json")),
				path: join($rootDir, name + ".json"),
				size: formatSize(stat.size),
				createdTime: moment(stat.ctimeMs).format("DD/MM/YY HH:mm:ss"),
			};
		} catch (err) {
			console.log(err);
			return `failed loading file status`;
		}
	}
}

module.exports = Database;
