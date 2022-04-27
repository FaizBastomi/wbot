let voteMap = new Map();
let $data = null;

class Votes {
	constructor() {}

	/**
	 * Create new vote
	 * @param {string} roomId group id
	 * @param {string} owner sender id
	 */
	create(roomId, owner, name = "voting") {
		if (name === "") name = "voting";
		voteMap.set(roomId, { name, owner, upvote: [], downvote: [] });
	}

	/**
	 * Delete vote
	 * @param {string} roomId group id
	 * @param {string} owner sender id
	 * @returns {boolean}
	 */
	delete(roomId, owner) {
		$data = voteMap.get(roomId);

		if (owner !== $data.owner) {
			$data = null;
			return false;
		} else {
			voteMap.delete(roomId);
			$data = null;
			return true;
		}
	}

	/**
	 * Get current vote data
	 * @param {string} roomId group id
	 */
	show(roomId) {
		$data = voteMap.get(roomId);
		let result_data = { present: false, data: null };
		if (!$data) {
			return result_data;
		} else {
			(result_data.present = true), (result_data.data = $data);
			$data = null;
			return result_data;
		}
	}

	/**
	 * Upvote
	 * @param {string} roomId group id
	 * @param {string} participant sender id
	 * @returns {"added"|"voted"}
	 */
	upvote(roomId, participant) {
		$data = voteMap.get(roomId);
		if ($data.downvote.includes(participant)) {
			$data.downvote.splice($data.downvote.indexOf(participant), 1);
			$data.upvote.push(participant);
			voteMap.set(roomId, $data);
			$data = null;
			return "added";
		} else if (!$data.upvote.includes(participant)) {
			$data.upvote.push(participant);
			voteMap.set(roomId, $data);
			$data = null;
			return "added";
		} else {
			return "voted";
		}
	}

	/**
	 * Downvote
	 * @param {string} roomId group id
	 * @param {string} participant sender id
	 * @returns {"added"|"downvoted"}
	 */
	downvote(roomId, participant) {
		$data = voteMap.get(roomId);

		if ($data.upvote.includes(participant)) {
			$data.upvote.splice($data.upvote.indexOf(participant), 1);
			$data.downvote.push(participant);
			voteMap.set(roomId, $data);
			$data = null;
			return "added";
		} else if (!$data.downvote.includes(participant)) {
			$data.downvote.push(participant);
			voteMap.set(roomId, $data);
			$data = null;
			return "added";
		} else {
			$data = null;
			return "downvoted";
		}
	}

	/**
	 * Delete sender vote
	 * @param {string} roomId group id
	 * @param {string} participant sender id
	 * @returns {"deleted"|"no_vote"}
	 */
	delete_vote(roomId, participant) {
		$data = voteMap.get(roomId);

		if ($data.upvote.includes(participant)) {
			$data.upvote.splice($data.upvote.indexOf(participant), 1);
			voteMap.set(roomId, $data);
			$data = null;
			return "deleted";
		} else if ($data.downvote.includes(participant)) {
			$data.downvote.splice($data.downvote.indexOf(participant), 1);
			voteMap.set(roomId, $data);
			$data = null;
			return "deleted";
		} else {
			$data = null;
			return "no_vote";
		}
	}
}

module.exports = Votes;
