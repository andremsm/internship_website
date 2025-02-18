const { connectAndListDB } = require("../mongodb/importData.js");

const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const fs = require("fs");

verifyToken = async (req, res, next) => {
	let token = req.headers["x-access-token"];

	if (!token) {
		//const rawData = fs.readFileSync(
		//	"./app/files/json_output_nonames.json",
		//	"utf8"
		//);
		//const jsonSend = JSON.parse(rawData);
		const jsonSend = await connectAndListDB(false);
		//console.log(jsonSend);
		res.setHeader("Content-Type", "application/json");
		return res.status(203).send(jsonSend);
		/*return res.status(403).send({
			message: "No token provided.",
		});*/
	}

	try {
		const decoded = await jwt.verify(token, config.secret);
		req.userId = decoded.id;
		next();
	} catch (err) {
		//const rawData = fs.readFileSync(
		//	"./app/files/json_output_nonames.json",
		//	"utf8"
		//);
		const jsonSend = await connectAndListDB(false);
		//console.log(jsonSend);
		res.setHeader("Content-Type", "application/json");
		return res.status(203).send(jsonSend);
	}

	/* sync version with .json instead of mongodb
	jwt.verify(token, config.secret, (err, decoded) => {
		if (err) {
			const rawData = fs.readFileSync(
				"./app/files/json_output_nonames.json",
				"utf8"
			);
			//const jsonSend = JSON.parse(rawData);
			const jsonSend = connectAndListDB(false);
			console.log(jsonSend);
			res.setHeader("Content-Type", "application/json");
			return res.status(203).send(jsonSend);
			//return res.status(401).send({
			//	message: "Unauthorized.",
			//});
		}
		req.userId = decoded.id;
		next();
	});
	*/
};

isAdmin = async (req, res, next) => {
	try {
		const user = await User.findByPk(req.userId);
		if (user) {
			const roles = await user.getRoles();
			for (let i = 0; i < roles.length; i++) {
				if (roles[i].name === "admin") {
					next();
					return;
				}
			}

			const jsonSend = await connectAndListDB(false);
			res.setHeader("Content-Type", "application/json");
			res.status(203).send(jsonSend);
			return;
		} else {
			const jsonSend = await connectAndListDB(false);
			res.setHeader("Content-Type", "application/json");
			res.status(203).send(jsonSend);
		}
	} catch (error) {
		console.log(error);
	}
	/* sync version with .json instead of mongodb
	User.findByPk(req.userId).then((user) => {
		if (user) {
			user.getRoles().then((roles) => {
				for (let i = 0; i < roles.length; i++) {
					if (roles[i].name === "admin") {
						next();
						return;
					}
				}

				const rawData = fs.readFileSync(
					"./app/files/json_output_nonames.json",
					"utf8"
				);
				const jsonSend = JSON.parse(rawData);
				//console.log(jsonSend);
				res.setHeader("Content-Type", "application/json");
				res.status(203).send(jsonSend);
				//res.status(403).send({
				//	message: "Require Admin Role.",
				//});
				return;
			});
		} else {
			const rawData = fs.readFileSync(
				"./app/files/json_output_nonames.json",
				"utf8"
			);
			const jsonSend = JSON.parse(rawData);
			//console.log(jsonSend);
			res.setHeader("Content-Type", "application/json");
			res.status(203).send(jsonSend);
			//res.status(403).send({
			//	message: "Require Admin Role.",
			//});
		}
	});
	*/
};

isModerator = (req, res, next) => {
	User.findByPk(req.userId).then((user) => {
		if (user) {
			user.getRoles().then((roles) => {
				for (let i = 0; i < roles.length; i++) {
					if (roles[i].name === "moderator") {
						next();
						return;
					}
				}

				res.status(403).send({
					message: "Require Moderator Role.",
				});
			});
		} else {
			res.status(403).send({
				message: "Require Moderator Role.",
			});
		}
	});
};

isModeratorOrAdmin = (req, res, next) => {
	User.findByPk(req.userId).then((user) => {
		if (user) {
			user.getRoles().then((roles) => {
				for (let i = 0; i < roles.length; i++) {
					if (roles[i].name === "moderator") {
						next();
						return;
					}

					if (roles[i].name === "admin") {
						next();
						return;
					}
				}

				res.status(403).send({
					message: "Require Moderator or Admin Role.",
				});
			});
		} else {
			res.status(403).send({
				message: "Require Moderator or Admin Role.",
			});
		}
	});
};

const authJwt = {
	verifyToken: verifyToken,
	isAdmin: isAdmin,
	isModerator: isModerator,
	isModeratorOrAdmin: isModeratorOrAdmin,
};
module.exports = authJwt;
