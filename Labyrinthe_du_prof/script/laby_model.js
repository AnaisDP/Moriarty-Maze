/*
	(c) Platypus SAS 2015-2016
	Release version - v2
	Author - Jules & Franck Lepoivre
	Release date - 2016/03/04 - TP 2 ESILV 2A ACS - Labyrinthes
*/

// affiche un tableau 2D (for debug)
function print_2d_array(a) {
	for (var i = 0; i < a.length; i++) {
		for (var j = 0; j < a[i].length; j++) {
			document.write(a[i][j] + " ");
		}
		document.write("<br/>");
	}
}

//"use strict";
// Modèle de données : chaque cellule est entourée de 0, 1, 2, 3 ou 4 murs.
// On code la présence de chaque mur par un chiffre binaire distinct :
// 1 pour le mur N, 10 (2) pour le mur E, 100 (4) pour le mur S, 1000 (8) pour le mur W.
// La valeur de chaque cellule est codée par simple somme de ces valeurs selon les murs présents ou pas.


// retourne un tableau de n lignes par m colonnes
function new_2d_array(n, m) {
	if (n === 0 || m === 0) return;
	var a = new Array(n);
	for (var i = 0; i < a.length; i++) a[i] = new Array(m);
	return a;
}

// initialise le tableau a en affectant à toutes ses cellules la valeur v
function init_2d_array(a, v) {
    var i, j;
	for (i = 0; i < a.length; i++)
		for (j = 0; j < a[i].length; j++)
			a[i][j] = v;
}

// initialise le tableau a en affectant à toutes ses cellules la valeur v
function random_init_maze(a) {
    var i, j;
	for (i = 0; i < a.length; i++)
		for (j = 0; j < a[i].length; j++)
			a[i][j] = Math.floor(Math.random() * 16);
}

// fournir un corrigé de ce qui était demandé au TP 1
function has_N_wall(v) { return (v & 1) == 1; } // retourne vrai ssi le mur N existe
function has_E_wall(v) { return (v & 2) == 2; }
function has_S_wall(v) { return (v & 4) == 4; }
function has_W_wall(v) { return (v & 8) == 8; }

function css_cell_code(v) {
	return (has_N_wall(v) ? "N " : "")
	     + (has_E_wall(v) ? "E " : "")
	     + (has_S_wall(v) ? "S " : "")
	     + (has_W_wall(v) ? "W " : "");
}


// creusement de galeries
// toutes les cellules sont fermées (4 murs => valeur 15)
// on démarre par exemple par la cellule NW et on tire alétoirement l'une des 4 directions possibles
// en prenant soin d'éliminer celles qui mènes soit en dehors du tableau, soit vers une position déjà visitée
// on marque la position de départ comme visitée.
// on se déplace alors vers la position suivante, en faisant sauter une 'cloison'
// on recommence : tirage d'une direction parmi celles qui n'ont pas été déjà visitées.
// etc.. déjà fait - retrouver.
// si toutes les possibilités sont fermées, on revient en arrière (backtracking) jusqu'à la dernière position
// d'où pertaient plusieurs choix
// => A concevoir sur papier + réaliser et teste
// finalement : on se donne un point d'entrée et un point de sortie en désignant deux côtés
//


// une cellule a été explorée ssi elle n'a plus ses 4 murs (i.e. son code diffère de 15)
// donne la liste des cellules adjacentes à la cellule i, j qui n'ont pas encore été visitées
function explorable(laby, i, j) {
	var a = []; // création d'un tableau vide
	var k = 0;
	if (i > 0)                  if (laby[i - 1][j] == 15) a[k++] = 1;
	if (j < laby[0].length - 1) if (laby[i][j + 1] == 15) a[k++] = 2;
	if (i < laby.length - 1)    if (laby[i + 1][j] == 15) a[k++] = 4;
	if (j > 0)                  if (laby[i][j - 1] == 15) a[k++] = 8;
	return a;
}

// la seule raison de rendre cet algorithme récursif itératif (utiliser une pile) est d'échapper à la taille maximale de la pile d'appels (call stack)
// mais cette raison est motivée par la version mutijoueurs avec labyrinthe immense avec vues subjectives (1ère personne) pour les différents utilisateurs
// tirage aléatoire d'une direction parmi les 1, 2, 3 ou 4 fournies
function dig(laby, i, j) {
	//console.log("dig(" + i + ", " + j + ")");
	var a = explorable(laby, i, j); // on récupère celles des 4 cellules adjacentes qui n'ont pas encore été explorées
	// s'il n'en existe aucune, on ne poursuit pas et on retourne 0 (aucun mur na été creusé)
	if (a.length == 0) return 0;
	// s'il en existe au moins une, on effectue un tirage aléatoire pour choisir l'une d'entre elles
	var dir = Math.floor(Math.random() * a.length);
	// on fait tomber la cloison qui sépare la cellule courante de la cellule adjacente choisie
	laby[i][j] -= a[dir];
	// et on relance récursivement l'algorithme sur la cellule adjacente sélectionnée
	switch (a[dir]) {
		case 1 : laby[i - 1][j] -= 4; dig(laby, i - 1, j); break;
		case 2 : laby[i][j + 1] -= 8; dig(laby, i, j + 1); break;
		case 4 : laby[i + 1][j] -= 1; dig(laby, i + 1, j); break;
		case 8 : laby[i][j - 1] -= 2; dig(laby, i, j - 1); break;
	}
	// l'algorithme se relance sur la cellule courante (backtracking) au cas où il lui resterait des voisines à explorer
	dig(laby, i, j);
}

// creuse une entrée et une sortie
function dig_ES(laby) {
	entry_pos[0] = Math.floor(Math.random() * laby.length);
	entry_pos[1] = 0;
	//laby[entry_pos[0]][entry_pos[1]] -= 8; // réactiver ouvrirait l'entrée et permettrait à l'utilisateur de naviguer en dehors de l'enceinte du labyrinthe

	exit_pos[0] = Math.floor(Math.random() * laby.length);
	exit_pos[1] = laby[0].length - 1;
	laby[exit_pos[0]][exit_pos[1]] -= 2;

	user_pos[0] = entry_pos[0];
	user_pos[1] = entry_pos[1];
}


function modifyStyleSheet() {
	var ss = document.styleSheets[0];
	console.log('nb css : ' + document.styleSheets.length);
	console.log('css href : ' + document.styleSheets[0].href);
	console.log('css title : ' + document.styleSheets[0].title);
	console.log('css type : ' + document.styleSheets[0].type);
	console.log('css rules : ' + document.styleSheets[0].rules);
	if (!ss) console.log('Pas de ss');
	else console.log('nb rules : ' + ss + ' of size ' + ss.cssRules.length);
	var i = 0;
	while (ss.rules[i].selectorText != "div.N") i++;
	ss.cssRules[i].style.borderTop = "10px solid";
}