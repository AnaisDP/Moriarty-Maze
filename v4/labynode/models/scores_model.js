var mongoose = require('mongoose');
	Schema = mongoose.Schema;
var scoreSchema = new Schema({
    player: String,
    score: Number,
    dimensions: Number,
    moves: Number,
    bumps: Number,
    time: Number,
    time_left: Number,
    monsters: Number,
    monsters_behavior: Boolean,
    bonus: Number,
    malus: Number,
    game: Number
});
mongoose.model('Score',scoreSchema);