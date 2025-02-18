/*//HTTPS (needs valid certificate)
const https = require("https");
const fs = require("fs");
*/
const express = require("express");
const cors = require("cors");

const app = express();

/*//HTTPS (needs valid certificate)
const key = fs.readFileSync(__dirname + "/keys/selfsigned.key");
const cert = fs.readFileSync(__dirname + "/keys/selfsigned.crt");
*/

/*//HTTPS (needs valid certificate)
const serverOptions = {
	key: key,
	cert: cert,
};
*/

const corsOptions = {
	//origin: "http://localhost:3000",
	//origin: "http://10.56.14.26:3000",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// database
const db = require("./app/models");
const Role = db.role;

db.sequelize.sync();
//Comente a linha acima e descomente as linhas abaixo se quiser apagar as
//tabelas do banco de dados de usuários.
//db.sequelize.sync({ force: true }).then(() => {
//	console.log("Drop and Resync Db");
//	initial();
//});

// simple route
app.get("/", (req, res) => {
	res.send(
		"<html> <head></head><body><h1>AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA</h1></body></html>"
	);
});

require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

// set port, listen for requests
//const PORT = process.env.PORT || 8080;
const PORT = 8080;

//HTTPS (needs valid certificate)
//const server = https.createServer(serverOptions, app);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});

function initial() {
	Role.create({
		id: 1,
		name: "user",
	});
	Role.create({
		id: 2,
		name: "moderator",
	});
	Role.create({
		id: 3,
		name: "admin",
	});
}

//.\mysqld --console
//.\mysql -u root -p
//cmd .\mongod --dbpath=C:\Users\amsmarques\.mongodb\mongodb-data
//or (new)
//cmd .\mongod --dbpath=C:\Program Files\MongoDB\Data
