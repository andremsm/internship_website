const fs = require("fs");
const { connectAndListDB } = require("../mongodb/importData");

exports.allAccess = (req, res) => {
	res.status(200).send({ message: "Public Content." });
};

exports.userBoard = (req, res) => {
	res.status(200).send({ message: "User Content." });
};

exports.adminBoard = async (req, res) => {
	try {
		const jsonSend = await connectAndListDB(true);
		//console.log(jsonSend);
		res.setHeader("Content-Type", "application/json");
		res.status(200).send(jsonSend);
	} catch (error) {
		console.log(error);
		res.status(500).send({
			message: "Erro ao buscar dados.",
		});
	}
	/* sync version with .json file instead of mongodb
	const rawData = fs.readFileSync(
		"./app/files/json_output_full.json",
		"utf8"
	);
	const jsonSend = JSON.parse(rawData);
	//console.log(jsonSend);
	res.setHeader("Content-Type", "application/json");
	res.status(200).send(JSON.stringify(jsonSend));
	*/
};

exports.moderatorBoard = (req, res) => {
	res.status(200).send({ message: "Moderator Content." });
};
