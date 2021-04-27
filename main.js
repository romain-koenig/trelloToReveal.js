const fetch = require('node-fetch');
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

	logging(subjects);

}

// PROGRAM STARTS HERE

getProjectsFromTrello();