// appel objet mongoose, nécessaire pour mettre à disposition la base de données et le dialogue avec...
var mongoose = require('mongoose');
    // le schema est le modèle de données (en relationnel, ce sont les tables, ici ce sont des documents)
    Schema = mongoose.Schema;

// instanciation du modèle de données (plus puissant qu'une table users :p )
var UserSchema = new Schema({
	username: {type: String, unique: true},
	email: {type: String, unique: true},
	hashed_password: String,
    date: Date
});

// pour pouvoir faire appel au schéma ailleurs :
mongoose.model('User',UserSchema);