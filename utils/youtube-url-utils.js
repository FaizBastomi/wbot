const validQueryDomains = new Set([
	"youtube.com",
	"gaming.youtube.com",
	"music.youtube.com",
	"www.youtube.com",
	"m.youtube.com",
]);

const validPathDomains = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)/;
const getYoutubeID = function (link) {
	const parsed = new URL(link);
	let id = parsed.searchParams.get("v");
	if (validPathDomains.test(link) && !id) {
		const paths = parsed.pathname.split("/");
		id = parsed.host === "youtu.be" ? paths[1] : paths[2];
	} else if (parsed.hostname && !validQueryDomains.has(parsed.hostname)) {
		throw Error("Not a YouTube Domain");
	}
	if (!id) {
		throw Error(`No video id found: ${link}`);
	}
	id = id.substring(0, 11);
	if (!validateID(id)) {
		throw Error(`Video id (${id}) does not match expected ` + `format (${idRegex.toString()})`);
	}
	return id;
};

const validateURL = (url) => {
	try {
		getYoutubeID(url);
		return true;
	} catch {
		return false;
	}
};

const idRegex = /^[a-zA-Z0-9-_]{11}$/;
const validateID = (id) => idRegex.test(id);

module.exports = {
	getYoutubeID,
	validateURL,
};
