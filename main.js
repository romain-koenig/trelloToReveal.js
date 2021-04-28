const fetch = require('node-fetch');
const fsLibrary = require('fs');

const { logging } = require("./utils");

require('dotenv').config();


const REPORTING_List = {
	Id: process.env.REPORTING_ID
};

let list = REPORTING_List;
const TrelloApiKey = process.env.TRELLO_API_KEY;
const trelloToken = process.env.TRELLO_TOKEN;

async function getProjectsFromTrello() {

	const url = `https://api.trello.com/1/lists/${list.Id}/cards?key=${TrelloApiKey}&token=${trelloToken}`;
	logging(`Fetching from ${url}`);
	const response = await fetch(url, {
		method: 'GET'
	});

	const subjects = JSON.parse(await response.text());

	//logging(subjects);

	return subjects;

}


async function createReportingFile(templateFile, printingFcn, topics, outputFile) {


	fsLibrary.readFile(templateFile, (error, data) => {
		// In case of a error throw err exception. 
		if (error) {
			throw err;
		}
		else {
			const template = data.toString();
			const content = template.replace('<!-- Content here -->', topics.map(printingFcn).join("\n\n"));

			fsLibrary.writeFile(outputFile, content, (error) => {
				// In case of a error throw err exception. 
				if (error)
					throw err;
			});
		}
	})
}

const printCardPresentation = topic => {

	let topicTags = [];
	topic.labels.forEach(label => {
		topicTags.push(label.name);
	});

	const separator = " / "

	let tags = topicTags.reduce((list, current) => list.concat(current, separator), "");

	// Deleting " - " at the end of the string
	tags = tags.substring(0, tags.length - separator.length);

	logging(tags);

	return `
	<section>\n
		<h1>${topic.name}</h1>\n
		<small>${tags.trim()}</small>\n
		<p class="r-fit-text">${topic.desc.replace(/\n/g, '<br/>')}</p>\n
	</section>`;
}


// PROGRAM STARTS HERE
(async () => {

	const topics = await getProjectsFromTrello();

	createReportingFile("./template.html", printCardPresentation, topics, "./OUTPUT/Reporting.html");
})();