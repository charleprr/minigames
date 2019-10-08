const MongoClient = require('mongodb').MongoClient;
const secrets = require('./secrets.json');

class Database {

	static initialize(){
		Database.URI = "mongodb://"+secrets.databaseUsername+":"+secrets.databasePassword+"@ds331198.mlab.com:31198/minigames-database";
		Database.sync();
	}

	static add(collection, object){
		MongoClient.connect(Database.URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
			if (err) throw err;
			db.db("minigames-database").collection(collection).insertOne(object, function(err, res) {
				if (err) throw err;
				Database.sync();
                db.close();
			});
		});
	}

	static remove(collection, query){
		MongoClient.connect(Database.URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
			if (err) throw err;
			db.db("minigames-database").collection(collection).deleteOne(query, function(err, res) {
				if (err) throw err;
				Database.sync();
                db.close();
			});
		});
	}

	static update(collection, query, object){
		MongoClient.connect(Database.URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
			if (err) throw err;
			db.db("minigames-database").collection(collection).updateOne(query, object, function(err, res) {
				if (err) throw err;
				Database.sync();
                db.close();
			});
		});
	}

	static sync(){
		MongoClient.connect(Database.URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
			if (err) throw err;

			db.db("minigames-database").collection("highscores").find({}).toArray(function(err, results) {
				if (err) throw err;
				Database.highscores = results[0];
                db.close();
            });
		});
	}

};

module.exports = Database;
