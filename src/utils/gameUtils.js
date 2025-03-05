import {
	GAME_REGION_NEIGHBORS,
	NUMBER_OF_REGIONS,
	QUESTION_TYPES,
} from "../constants.js";
import { questionSets, rooms, users } from "../globals.js";
import { shuffleArray } from "../utils/universalUtils.js";

export const hasAnyAviableNeighbor = username => {
	const roomCode = users[username].roomCode;

	for (let idx = 0; idx < NUMBER_OF_REGIONS; idx++) {
		if (
			isPlayerRegionNeighbor(username, idx) &&
			rooms[roomCode].map[idx].owner === null
		)
			return true;
	}
	return false;
};

export const numberOfAviableRegions = roomCode => {
	let count = 0;
	for (let idx = 0; idx < NUMBER_OF_REGIONS; idx++) {
		if (rooms[roomCode].map[idx].owner === null) count++;
	}
	return count;
};

export const isPlayerRegionNeighbor = (username, regionIdx) => {
	const roomCode = users[username].roomCode;

	const playerRegions = [];

	for (let idx = 0; idx < NUMBER_OF_REGIONS; idx++) {
		if (rooms[roomCode].map[idx].owner !== username) continue;
		if (playerRegions.includes(idx)) continue;

		playerRegions.push(idx);
	}

	if (playerRegions.length === 0) {
		// player has no regions
		playerRegions.push(14);
	}

	return GAME_REGION_NEIGHBORS[regionIdx].some(regIdx =>
		playerRegions.includes(regIdx)
	);
};

export const pickPlayerColors = players => {
	const shuffledPlayers = shuffleArray(players);
	const playerColors = {};

	playerColors[shuffledPlayers[0]] = 0;
	playerColors[shuffledPlayers[1]] = 1;
	playerColors[shuffledPlayers[2]] = 2;

	return playerColors;
};

export const setCurrentQuestion = (roomCode, questionType) => {
	if (!questionSets[roomCode]) {
		console.error(`No question set found for room: ${roomCode}`);
		return;
	}

	let currentQuestion = null;

	switch (questionType) {
		case QUESTION_TYPES.PICK:
			if (!questionSets[roomCode].pickQuestions.length) {
				console.error("No more PICK questions available.");
				return;
			}
			currentQuestion = questionSets[roomCode].pickQuestions.pop();
			break;

		case QUESTION_TYPES.NUMERIC:
			if (!questionSets[roomCode].numericQuestions.length) {
				console.error("No more NUMERIC questions available.");
				return;
			}
			currentQuestion = questionSets[roomCode].numericQuestions.pop();
			break;

		case QUESTION_TYPES.IMAGE:
			if (!questionSets[roomCode].imageQuestions.length) {
				console.error("No more IMAGE questions available.");
				return;
			}
			currentQuestion = questionSets[roomCode].imageQuestions.pop();
			break;

		default:
			console.error("Invalid question type:", questionType);
			return;
	}

	if (!currentQuestion || !currentQuestion.id) {
		console.error("Invalid question format:", currentQuestion);
		return;
	}

	rooms[roomCode].currentQuestion = {
		id: currentQuestion.id,
		question: currentQuestion.question,
		type: questionType,
		category: currentQuestion.get_category,
		rightAnswer: currentQuestion.right_answer,
		...(questionType === QUESTION_TYPES.PICK ||
		questionType === QUESTION_TYPES.IMAGE
			? {
					possibleAnswers: shuffleArray([
						...currentQuestion.wrong_answers,
						currentQuestion.right_answer,
					]),
			  }
			: {}),
		...(questionType === QUESTION_TYPES.IMAGE
			? { image_url: currentQuestion.image_url }
			: {}),
	};
};

export const isInAnswers = (username, answers) => {
	if (answers.length === 0) {
		return false;
	}
	for (const answer of answers) {
		if (username === answer.username) {
			return true;
		}
	}
	return false;
};
