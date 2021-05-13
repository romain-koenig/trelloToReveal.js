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


	const template = fsLibrary.readFileSync(templateFile, 'utf8');


	const projects = topics.map(printingFcn).join("\n\n");

	logging(topics);
	logging(projects);

	const content = template.replace('<!-- Content here -->', projects);

	fsLibrary.writeFileSync(outputFile, content, 'utf8');

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

	let slide = ""

	slide = fsLibrary.readFileSync("./template_part.html", 'utf8');

	slide = slide.replace('<!-- TITLE -->', topic.name);
	slide = slide.replace('<!-- TAGS -->', tags);
	slide = slide.replace('<!-- CONTENT -->', topic.desc);

	return slide;
}


// PROGRAM STARTS HERE
(async () => {

	const topics = await getProjectsFromTrello();

	createReportingFile("./template.html", printCardPresentation, topics, "./OUTPUT/Reporting.html");


})();