var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var mongoose = require('mongoose');

var User = mongoose.model('User');
var Score = mongoose.model('Score');
var Game = mongoose.model('Game');

var util = require('util');


var Utils = require('../utils');
var utils = new Utils();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('pages/index', { user: req.user, msgs:utils.read_messages(req)});
});

/* GET play page. */
router.get('/play', utils.HasToBeConnected, function(req, res, next) {
    res.render('pages/play', {user: req.user, msgs:utils.read_messages(req)});
});

/* GET load page. */
router.get('/load', utils.HasToBeConnected, function(req, res, next) {
    //todo
    res.render('pages/play', {user: req.user, msgs:utils.read_messages(req)});
})

/* GET score page. */
router.get('/scores', function(req, res, next){
    res.render('pages/scores', {msgs:utils.read_messages(req)}); 
});

/* GET scores list. */
router.get('/scores_list', function(req, res, next){
    Score.find(function(err,scores){
        if (err) throw err;
        res.json(scores); 
    });
});

/* POST score.
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
*/
router.post('/score', function(req,res,next){
    //console.log(req.body)
    var score = new Score(req.body);
    //console.log(util.inspect(score));
    score.save(function(err){
        if (err){
            throw err;
        }
        res.send('Score saved on the server !');
    });
});

/* todo GET game details. */
router.get('/game_details', function(req, res, next){
    Game.find(function(err,games){
        if (err) throw err;
    });
    Game.findOne({gamenumber: req.body.gamenumber},function(err, doc){
		if (err){
			throw err;
		}
		if (doc){
			// envoyer les détails d'une partie
		} else {
            res.send('Game not found')
            return;
        }
	});
});

/* GET users list. */
router.get('/users', function(req, res, next) {
  User.find(function(err,users){
		if (err) throw err;
		res.json(users);
  });
});

/* GET signup page. */
router.get('/signup', function(req,res,next){
	res.render('pages/signup',{title: 'Signup to aMAZin', msgs:utils.read_messages(req)});
});

/* POST signup. */
router.post('/signup', function(req,res,next){
	console.log('signup demandé');
	//req.query pour les get, req.body pour les post
	if (!req.body.username || !req.body.password || !req.body.email){
		res.status(401);
        if (!req.body.username) utils.new_message(req,{type:'danger',msg:'User name not provided'});
        if (!req.body.email) utils.new_message(req,{type:'danger',msg:'Email not provided'});
        if (!req.body.password) utils.new_message(req,{type:'danger',msg:'Password not provided'});
        
		res.render('pages/signup', {title: 'Signup', msgs:utils.read_messages(req)});
		return;
	}
	console.log('signup ok -> find user ');
	// on vérif si l'user n'existe pas:
	User.findOne({username: req.body.username},function(err, doc){
		if (err){
			throw err;
		}
		if (doc){
			res.status(403);
            utils.new_message(req,{type:'danger',msg:'User already exists'});
			res.render('pages/signup',{title:'Signup', msgs:utils.read_messages(req)});
			return;
		}
		//sinon, on crée le mdp
		var myhash = utils.hashPW(req.body.password.toString());
		//on enregistre le nouvel utilisateur
		var user = new User({username: req.body.username, hashed_password:myhash, email: req.body.email});
		user.save(function(err){
			if (err){
				throw err;
			}
            utils.new_message(req,{type:'success',msg:'Account successfully created !'});
			res.render('pages/signup',{title:'Signup', msgs:utils.read_messages(req),success:true});
		});
	});
});

/* POST login. */
router.post('/login',function(req, res, next) {
    User.findOne({username: req.body.username},function(err, doc){
        if(err) throw err;
        if (!doc) {
            utils.new_message(req,{type:'danger',msg:'User does not exist'})
            res.redirect('/');
            return;
        }
        if (utils.hashPW(req.body.password) == doc.hashed_password){
            req.session.userId = doc._id;
            res.redirect('/room');
                
        }
        else {
            utils.new_message(req,{type:'danger',msg:'Password does not match'});
            res.redirect('/');
        }
    });
});

router.get('/room', utils.HasToBeConnected, function(req,res,next){
    res.render('pages/room',{title:'Room', msgs:utils.read_messages(req), user:req.user});
});
    
/* GET logout. */
router.get('/logout',function(req,res,next){
    if (err) {
        res.send('error logging out');
        throw err;
    } else res.send('logout done');   
});

module.exports = router;