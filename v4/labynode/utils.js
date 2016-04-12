var crypto = require('crypto');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var util = require('util');
function Utils(){}

/* renvoie un mot de passe haché en sha256 à partir d'un mot de passe */
Utils.prototype.hashPW = function(pwd) {
	return crypto.createHash('sha256').update(pwd).digest('base64').toString();
}

/* Système d'écriture des messages "système" */
Utils.prototype.new_message = function(req,message){
  if ((req)&&(req.session)){
      if (!req.session.msgs){
          req.session.msgs = [];          
      }
      console.log('message <-',message);
      req.session.msgs.push(message);
  }
}

/* Système de lecture des messages à l'utilisateur */
Utils.prototype.read_messages= function(req){
    if ((req)&&(req.session)&&(req.session.msgs)){
        var temp = util._extend({},req.session.msgs);
        req.session.msgs.length = 0;
        console.log('message ->',temp);
        return temp;
    } else return [];
}

/* Vérifie que l'utilisateur est connecté, sinon, le redirige sur la page d'accueil */
Utils.prototype.HasToBeConnected= function(req,res,next){
    if(!req.user) {
        res.redirect('/'); 
        this.new_message(req,{type:'warning',msg:'No user logged in'});
        return;
    }
    next();
}

Utils.prototype.check = function(req,res,next){
	if (!req.query.username){
		res.status(401);
		res.send('Unauthorized');
		return;
	}  
	next();
};

module.exports = Utils;