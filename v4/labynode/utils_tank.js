//pour aller plus loin: des tools qui peuvent être bien pratiques...

var Utils = {};

/**
* Retourne une erreur 401 si l'utilisateur EST connecté, laisse passer la requête sinon.
* @param {Object} req
* @param {Object} res
* @param {Object} next
* @return {null}
*/
Utils.hasToBeDisconnected = function(req, res, next){
   if(Utils.connected(req)){
       res.status(401);
       res.send("Vous êtes déjà connecté");
       return;
   }
   next();
};

/**
* Retourne une erreur 401 si l'utilisateur N'EST PAS connecté, laisse passer la requête sinon.
* @param {Object} req
* @param {Object} res
* @param {Object} next
* @return {null}
*/
Utils.hasToBeConnected = function(req, res, next){
   if(!Utils.connected(req)){
       res.status(401);
       res.send("Vous n'êtes pas connecté");
       return;
   }
   next();
};

/**
* Retourne une erreur 401 si l'utilisateur N'est pas administrateur, laisse passer la requête sinon.
* @param {Object} req
* @param {Object} res
* @param {Object} next
* @return {null}
*/
Utils.isAdmin = function(req, res, next){
   if(req.user && req.user.attributions) {
       for (var i = 0; i < req.user.attributions.length; i++) {
           if (req.user.attributions[i].name == "ROLE_ADMIN" && Utils.isActive(req.user.attributions[i])) {
               next();
               return;
           }
       }
   }
   res.status(401);
   res.send("Vous n'avez pas les droits nécessaires");
};
 
* Retourne l'objet échappé de ses caractères qui pourraient induire une faille XSS et/ou une injection MongoDB
* @param v
?* @returns {*?}
*/
Utils.sanitize = function(v, options) {
   options = options || [];

   if (v instanceof Object) {
       for (var key in v) {
           if (/^\$/.test(key)) {
               delete v[key];
           }
           else if(typeof v[key] === "string" && options.indexOf(key) < 0){
               v[key] = entities.encode(v[key]);
           }
           else {
               Utils.sanitize(v[key]);
           }
       }
   }
   else if(typeof v == "string"){
       return entities.encode(v);
   }
   return v;
};