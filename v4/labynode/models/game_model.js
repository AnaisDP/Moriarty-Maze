var mongoose = require('mongoose');
	Schema = mongoose.Schema;
var gameSchema = new Schema({
    nbplayers: Number
});
mongoose.model('Game',gameSchema);

/*
dimensions of the labyrinth :  
5  x  5
maze cell size :  
50 px 
Select a timing difficulty : (0 - 240 s)  
Number of monsters :  
0 - 10
Monster behavior : when a monster and the player share a spot,  
 value="1" Game over !
 value="2" Fight !

+ Nb players 
+ Joueurs en cours et leur position
+ Game number
*/

