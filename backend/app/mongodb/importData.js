//import { MongoClient } from "mongodb";

async function listDatabases(client, authentication) {
	//const participantes = authentication ? 1 : 0;
	const projection = authentication
		? { _id: 0 }
		: { _id: 0, Participantes: 0 };
	const databasesList = await client
		.db("json_test")
		.collection("json_test")
		.find({}, { projection: projection })
		.toArray(function (err, result) {
			if (err) throw err;
			//console.log(result);
		});

	return JSON.stringify(databasesList);
	//databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
}

connectAndListDB = async (authentication) => {
	/**
	 * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
	 * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
	 */
	const { MongoClient } = require("mongodb");
	const uri = "mongodb://127.0.0.1:27017/json_test";
	const client = new MongoClient(uri);

	let database = undefined;

	try {
		await client.connect();
		database = await listDatabases(client, authentication);
	} catch (e) {
		console.error(e);
	} finally {
		await client.close();
		return database;
	}
	return database;
};

module.exports = { connectAndListDB };
