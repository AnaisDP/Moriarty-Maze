/**
 * (c) Platypus SAS 2015-2016
 *     Release version - v3
 *     Authors - Franck, Jules, Marie Lepoivre, Kévin Tan
 *     Release date - 2016/03/19
 */

"use strict"; // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Strict_mode

// DECRIRE ICI LE PRINCIPE GENERAL DE LA SOLUTION BASEE SUR LE MAINTIEN D'UN CACHE DE DONNEES LOCALES REPRESENTANT
// LA VUE LOCALE DU CLIENT SUR LE LABYRINTHE PLANETE

//
// paramètres généraux du client

// constantes et variables globales qui définissent les paramètres par défaut qui peuvent être redéfinis
// au moment de l'initialisation (chargement de la page et interaction avec le serveur)

// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Instructions/const
const
	N = 38, E = 39, S = 40, W = 37,
    Hc = 500,              // hauteur du cache (partie de labyrinthe mémorisée côté client)
	Lc = 500,              // largeur du cache
    Hv = 50,               // hauteur de la vue
    Lv = 70,               // largeur de la vue (sous-partie qui correspond à la zone qui s'affiche autour du joueur)
    Mmin = 10,             // marge minimale en pourcent de la marge lorsque l'utilisateur est au centre du cache
    Fsize = 25,            // dimension relative d'un fragment en pourcent de la dimension du cache
    Lf = Lc * Fsize / 100, // largeur d'un fragment téléchargé (mouvements horizontaux)
    Hf = Hc * Fsize / 100;


// Modèle de données dans data : chaque cellule est entourée de 0, 1, 2, 3 ou 4 murs.
// On code la présence de chaque mur par un chiffre binaire distinct :
// 1 pour le mur N, 10 (2) pour le mur E, 100 (4) pour le mur S, 1000 (8) pour le mur W.
// La valeur de chaque cellule est codée par simple somme de ces valeurs selon les murs présents ou pas.

var laby = {
	// dimensions du cache
	H : Hc, L : Lc,
	// coordonnées du coin NE du fragment relativement au labyrinthe (côté serveur)
	i : 0, j : 0,
	// le cache contenant un fragment local de labyrinthe             
	data : new_2d_array(Hc, Lc),
	// les marges N, E, S, W entre la vue du joueur et les limites du cache 
	mn : Math.round((Hc - Hv) / 2),
	ms : Math.round((Hc - Hv) / 2),
	me : Math.round((Lc - Lv) / 2),
	mw : Math.round((Lc - Lv) / 2),
	// les coordonnées du centre du cache
	ic : Math.round(Hc / 2),
	jc : Math.round(Lc / 2),
	// marges verticale et horizontale minimale qui déclenchent le téléchargement d'un fragment
	mv_min : Math.round(mn * Mmin / 100),
	mh_min : Math.round(me * Mmin / 100)
};

// à revoir => les entrées sont des éléments statique (ou pas d'ailleurs) du labyrinthe => parmi les objets qui s'y juxtaposent
// par ailleurs, il pourra y avoir plusieurs entrées et sorties ou autres passages (raccourcis par exemple)
var entry_pos = [];
var exit_pos = [];

// position initiale du joueur relative au cache (ce ne sont donc pas ses coordonnées absolues sur le labyrinthe)
var player = {
	i : laby.ic,
	j : laby.jc
};

// paramètres de style => responsivité
var style = {
	csz = 50,		// côté d'une cellule
	wsz = 5,		// épaisseur d'un mur
	psz = 0.5		// épaisseur d'une porte
};


// => ce qui suit à déplacer dans utils.js

// retourne un tableau de m lignes par n colonnes
function new_2d_array(m, n) {
	if (!(m && n)) return;
	var a = new Array(m);
	for (var i = 0; i < a.length; i++) a[i] = new Array(n);
	return a;
}

// initialise le tableau a en affectant à toutes ses cellules la valeur v
function init_2d_array(a, v) {
    var i, j;
	for (i = 0; i < a.length; i++)
		for (j = 0; j < a[i].length; j++)
			a[i][j] = v;
}

// affiche un tableau 2D
function print_2d_array(a) {
	for (var i = 0; i < a.length; i++) {
		for (var j = 0; j < a[i].length; j++) {
			document.write(a[i][j] + " ");
		}
		document.write("<br/>");
	}
}

// détermine si le code v qui représente une cellule du labyrinthe comporte un mur ou non dans chacune des 4 directions
// utilisé d'une part par l'algorithme de génération aléatoire de labyrinthe,
// par les détection des collisions avec les murs lors des mouvements du joueur d'autre part
function has_N_wall(v) { return (v & 1) == 1; } // retourne vrai ssi le mur N existe
function has_E_wall(v) { return (v & 2) == 2; }
function has_S_wall(v) { return (v & 4) == 4; }
function has_W_wall(v) { return (v & 8) == 8; }

// => etc.. c'est la récup du code des TP 1, 2, 3

function onLoad() {
	// construction de la page
	initPage();
	// interaction préalable avec le serveur pour récupérer les coordonnées du joueur
	// actuellement, en attendant d'avoir l'authentification, on les met à 0
	player.i = player.j = 0;
	initLaby(player);
}

function initPage() {
	// les trucs de base à faire...
	player.style = document.getElementById("player").style;

}

// initialise le cache à partir du serveur
function initLaby(player) {
	// envoi d'une requête d'initialisation de partie vers le serveur et récupération de globals en version JSON
	// distinguer les deux cas où le joueur démarre la partie ou revient sur une partie en cours
	// pour le second cas, il il y a préalablement à mettre en place une authentification
	laby.i = player.i - laby.H / 2;
	laby.j = player.j - laby.L / 2;
	laby.data = getFragmentFromServer(laby.i, laby.j, laby.L, laby.H);
}

/* Gestion des déplacements du joueur */

// callback de l'événement clavier qui permet de réagir aux 4 touches fléchées et d'effectuer un mouvement
function tryToMove(event) {
    var dir = event.keyCode;
    if (W <= dir && dir <= S) {
    	if (movable(player, dir)) move(player, dir);
    	else notifyCollision(player, dir);
    }
}

// retourne vrai ssi la mouvement du joueur dans la direction donnée est possible
function movable(player, dir) {
	switch (dir) {
		case N : return !has_N_wall(laby[player.i][player.j]);
		case E : return !has_E_wall(laby[player.i][player.j]);
		case S : return !has_S_wall(laby[player.i][player.j]);
		case W : return !has_W_wall(laby[player.i][player.j]);
	}
}

// effectue le mouvement préalablement validé : met à jour le modèle et la vue,
// et déclenche si nécessaire la procédure de mise à jour du cache auprès du serveur
function move(player, dir) {
	// on met à jour les variables de marge et si le seuil bas est franchi, déclencher la mise à jour du cache
	switch (dir) {
		case N :
			player.i--; mn--; ms++;
			player.style.top = (csz * player.i) + "px"; // actualisation de la vue pour restituer le mouvement du joueur
			if (mn < mv_min) updateLabyData(player);    // téléchargement si nécessaire d'un nouveau fragment de labyrinthe
		case E :
			player.j++; me--; mw++;
			player.style.left = (csz * player.j) + "px";
			if (mn < mh_min) updateLabyData(player);
		case S :
			player.i++; mn++; ms--;
			player.style.top = (csz * player.i) + "px";
			if (mn < mv_min) updateLabyData(player);
		case W :
			player.j--; me++; mw--;
			player.style.left = (csz * player.j) + "px";
			if (mn < mh_min) updateLabyData(player);
	}
}

// notifie à l'utilisateur que le mouvement est impossible (ici, on se contente de logger)
function notifyCollision(player, dir) {
	var txt = dir == N ? 'N' : dir == E ? 'E' : dir == S ? 'S' : dir == W ? 'W' : '?';
	console.log('(' + player.i + ', ' + player.j + ') Déplacement impossible : mur ' + txt + ' !');
}

// Gestion du cache : interaction avec le serveur
function abs(x) { return x < 0 ? -x : x; }

function updateLabyData(player) {
	// décalages horizontal et vertical du joueur par rapport au centre du cache
	// => Ce qui suit peut encore être optimisé et rendu plus lisible, mais on attendra d'avoir une première version qui marche
	var h = player.i - laby.ic; // h = 0 => au centre, > 0 => au sud, < 0 => au nord
	var l = player.j - laby.ic; // l = 0 => au centre, > 0 => à l'est, < 0 => à l'ouest
	var f1, f2, H = laby.H, L = laby.L, i = laby.i, j = laby.j; // pour la lisibilité du code
	// si le joueur est au nord du centre
	if (h < 0) f1 = getFragmentFromServer(i + h, j + l, -h, L);
	// si le joueur est au sud du centre
	if (h > 0) f1 = getFragmentFromServer(i + H, j + l, h, L);
	// si le joueur est à l'ouest du centre
	if (l < 0) {
		if (h < 0) f2 = getFragmentFromServer(i,     j + l, H + h, l);
		      else f2 = getFragmentFromServer(i + h, j + l, H - h, l);
	}
	// si le joueur est à l'est du centre
	if (l > 0) {
		if (h < 0) f2 = getFragmentFromServer(i,     j + L, H + h, l);
		      else f2 = getFragmentFromServer(i + h, j + L, H - h, l);
	}
	// C'est ici qu'il faut intégrer les fragments et oublier une partie de l'ancien cache
	// 1) d'abord supprimer ce qu'on ne garde pas
	// 2) puis ajouter les lignes du fragment 2 aux lignes conservées
	// 3) puis ajouter le les lignes du fragment 1 en complément des lignes conservées et complétées

	// 1) d'abord supprimer ce qu'on ne garde pas
	// on rabote d'abord les lignes en trop, puis les parties de lignes en trop de ce qui reste
	// suivant le mouvement vertical, on retire des lignes au début ou à la fin du tableau laby.data
	var a = laby.data;
	var s = a.length - 1 + h;   // pour la lisibilité du code
	if (h < 0) a.splice(s, -h); // suppression des -h dernières lignes
	if (h > 0) a.splice(0, h);  // suppression des h premières lignes
	// suivant le mouvement horizontal, on retire des débuts ou fins de lignes laby.data[i]
	s = a[0].length - 1 + l;   // lisibilité et micro optimisation
	for (var k = 0; k < a.length; k++) {
		if (l < 0) a[k].splice(s, -l);
		if (l > 0) a[k].splice(0, l);
	}

	// 2) puis ajouter les lignes du fragment 2 aux lignes conservées
	// on utilise une technique avancée pour appliquer plusieurs fois unshift / push (méthodes monoargument)
	// sur chacun des éléments d'un tableau
	// voir https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Function/apply
	//      section Utiliser apply et des fonctions natives
	for (var k = 0; k < a.length; k++) {
		if (l < 0) Array.prototype.unshift.apply(a[k], f2[k]); // => vérifier qu'il n'y a pas inversion, sinon précéder d'un reverse
		if (l > 0) Array.prototype.push.apply(a[k], f2[k]);
	}

	// 3) puis ajouter le les lignes du fragment 1 en complément des lignes conservées et complétées
	if (h < 0) Array.prototype.unshift.apply(a, f1); // => idem, vérifier qu'il n'y a pas d'inversion
	if (h > 0) Array.prototype.push.apply(a, f1);

	// on termine en actualisant les autres informations
	laby.i += h, laby.j += l;
	player.i = laby.ic;
	player.j = laby.jc;
}

// récupère auprès du serveur un fragment de labyrinthe de coordonnées NE i, j et de dimensions H, L
function getFragmentFromServer(i, j, H, L) {
	// un coup de Sophocle et c'est bon !
}












