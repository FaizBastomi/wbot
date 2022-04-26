const brainly = require("brainly-scraper-v2");
const Bluebird = require("bluebird");
let availableLang = ["id (default)", "us", "tr", "es", "pt", "ru", "ro", "ph", "pl", "hi"];

module.exports = {
	name: "brainly",
	category: "information",
	limit: true,
	consume: 3,
	use: `[language] <question>\n\nAvailable language:\n${availableLang.join("\n")}`,
	desc: "Help find the right asnwers for school assignments.",
	async exec({ msg, args }) {
		let searchResult,
			textMsg = "";
		try {
			if (!args.length > 0) return await msg.reply("No question");
			if (availableLang.includes(args[0])) {
				searchResult = await search(args.slice(1).join(" "), args[0]);
				for (let i = 0; i < searchResult.length; i++) {
					textMsg +=
						`*Pertanyaan*: ${searchResult[i].question.trim()}\n*Jawaban*: ${searchResult[
							i
						].answer.trim()}` +
						`\n${
							searchResult[i].ansMedia
								? "*Attachment*:\n" + searchResult[i].ansMedia.join("\n") + "\n\n"
								: "\n\n"
						}`;
				}
				await msg.reply(textMsg);
			} else {
				searchResult = await search(args.join(" "));
				for (let i = 0; i < searchResult.length; i++) {
					textMsg +=
						`*Pertanyaan*: ${searchResult[i].question}\n*Jawaban*: ${searchResult[i].answer}` +
						`\n${
							searchResult[i].ansMedia
								? "*Attachment*:\n" + searchResult[i].ansMedia.join("\n") + "\n\n"
								: "\n\n"
						}`;
				}
				await msg.reply(textMsg);
			}
			(searchResult = null), (textMsg = null);
		} catch (e) {
			await msg.reply(`Error: ${e.message}`);
		}
	},
};

const search = (question, lang = "id") =>
	new Bluebird(async (resolve, reject) => {
		let brainlyResult = await brainly(question, 2, lang),
			finalResult = [];
		brainlyResult.data.forEach(({ pertanyaan, jawaban }) => {
			jawaban.forEach((answer) => {
				let ans = {
					question: pertanyaan,
					answer: answer.text,
					ansMedia: answer.media,
				};
				finalResult.push(ans);
				ans = null;
			});
		});
		resolve(finalResult);
		(finalResult = null), (brainlyResult = null);
	});
