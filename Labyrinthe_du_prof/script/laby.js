/*
	(c) Platypus SAS 2015-2016
	Release version - v2
	Author - Jules & Franck Lepoivre
	Release date - 2016/03/04 - TP 2 ESILV 2A ACS - Labyrinthes
*/


/* Déclaration des variables globales (accessibles partout dans le JS) */
var laby;				// le labyrinthe
var csz = 50;			// côté d'une cellule
var wsz = 5;			// épaisseur d'un mur
var psz = 0.5;			// épaisseur d'une porte
var entry_pos = [];		// entrée du labyrinthe
var exit_pos = [];		// sortie du labyrinthe
var user_pos = [];		// position du joueur
var game_over = true;	//variable de gestion de la fin du jeu

// Affichage du labyrinthe et de ses murs, et du joueur
function print_maze(a) {
	//console.log("csz : " + csz + ", wsz : " + wsz);
    var i, j;
	var maze = document.querySelector('#maze');
	
	// Vider la div maze
	while (maze.hasChildNodes()) {
		maze.removeChild(maze.lastChild);
	};
	
	// Appliquer au labyrinthe des styles selon les paramètres entrés par l'utilisateur
	maze.setAttribute('style', 'width:' + (csz * a[0].length) + 'px; height:' + (csz * a.length) + 'px;');
	maze.setAttribute('class','maze');
	for (i = 0; i < a.length; i++) {
		for (j = 0; j < a[i].length; j++) {
			var div = document.createElement('div');
			div.setAttribute('id',i + "_" + j);
			div.setAttribute('class','cell ' + css_cell_code(a[i][j]) );
			div.setAttribute('style', ' top:'+ (csz * i) + '; left:' + (csz * j) + '; width:'+csz+'px; height:'+csz+'px;');
			maze.appendChild(div);
		}
	}
	
	/*
	// Dessiner les intersections
	for (i = 1; i < a.length; i++) {
		for (j = 1; j < a[i].length; j++) {
			var div = document.createElement('div');
			div.setAttribute('id','_' + i + "_" + j);
			div.setAttribute('class','cell_intersect');
			div.setAttribute('style','top:'+ (csz * i - wsz) + "; left:" + (csz * j - wsz) + ";");
			maze.appendChild(div);
		}
	}
	*/
	
	// En début de partie, le joueur est matérialisé sur la cellule d’entrée du labyrinthe :
	var user = document.createElement('div');
	user.setAttribute('id','user');
	user.setAttribute('style',"top:" + (csz * user_pos[0]) + "; left:" + (csz * user_pos[1]) + "; width:" + csz + "px; height:" + csz + "px;");
	maze.appendChild(user);
	
	// Marquage de la sortie :
	for (i = 0; i < a.length && has_E_wall(a[i][a[0].length - 1]); i++);
	document.getElementById(i + "_" + (a[0].length - 1)).style.backgroundColor = "#ff6666";
	exit_pos = [i,a[0].length - 1];
}

// Lancement d'une partie
function new_game(x,y,rep) {
	if (rep){
		laby = new_2d_array(x, y);
		init_2d_array(laby, 15);
		dig(laby, 0, 0);
		dig_ES(laby);
	}
	//modifyStyleSheet();
	user_pos[0] = entry_pos[0];
	user_pos[1] = entry_pos[1];
	print_maze(laby);	

}
// Initialisation du labyrinthe
function main(){
	// Récupération des variables saisies par l'utilisateur
	var x = parseInt(document.querySelector('#x').value);
	var y = parseInt(document.querySelector('#y').value);
	// Enlever le footer pour avoir une zone de jeu plus grande :
	document.querySelector('footer').style.visibility='hidden';
	// Lancement du jeu
	new_game(x,y,game_over);	
	game_over = false;
}

// Ajout de la possibilité de rejouer la partie en cours (reset), qui repositionne le joueur sur la position d'entrée du même laby et réinitialise le compte à rebours
function replay(){
	game_over = false;
	main();
}

/*
 > Insérer le gameplay initial ­ La possibilité de se déplacer
*/
function uniKeyCode(event) {
	var key = event.keyCode;
	setTimeout(function(){ lose(); }, 3000);
	// - On peut se déplacer avec les touches directionnelles du clavier en respectant la règle de ne pas pouvoir franchir un mur.
    // N : 38, E : 39, S : 40, W : 37
	// Si l'utilisateur utilise les touches de déplacement tandis que le jeu n'est pas en cours, on ne fait rien
	if(!document.getElementById("user")) return;
	// Lorsque l’utilisateur parvient à la sortie, cela déclenche la fin de partie et l’affichage d’un message qui le manifeste. Le jeu est alors bloqué et il n’est plus possible de se déplacer dans le labyrinthe.
	if (game_over) return;
    var user_style = document.getElementById("user").style;
    switch (key) {
    	case 37 : // W
    		if (!has_W_wall(laby[user_pos[0]][user_pos[1]])) {
    			user_pos[1]--;
    			user_style.left = (csz * user_pos[1]) + "px";
    		}
    		break;
		case 38 : // N
    		if (!has_N_wall(laby[user_pos[0]][user_pos[1]])) {
    			user_pos[0]--;
    			user_style.top = (csz * user_pos[0]) + "px";
    		}
    		break;
    	case 39 : // E
    		if (!has_E_wall(laby[user_pos[0]][user_pos[1]])) {
    			user_pos[1]++;
    			user_style.left = (csz * user_pos[1]) + "px";
    		}
    		break;
    	case 40 : // S
    		if (!has_S_wall(laby[user_pos[0]][user_pos[1]])) {
    			user_pos[0]++;
    			user_style.top = (csz * user_pos[0]) + "px";
    		}
    		break;
    }
	// Vérifier les conditions de victoire
	if ((user_pos[0] == exit_pos[0])&&(user_pos[1] == exit_pos[1])) win();
}

// Fonction générique d'affichage d'une modale pour la fin de la partie.
function show_modal(id,title){
	// stockage du code HTML de la modale à afficher dans une variable :
	var flow =
		'<div id="'+id+'" class="modal fade" role="dialog">'+
		  '<div class="modal-dialog">'+
			'<div class="modal-content">'+
			  '<div class="modal-header">'+
				'<a type="button" class="close" href="play.html" data-dismiss="modal">&times;</a>'+
				'<h4 class="modal-title">'+title+'</h4>'+
			  '</div>'+
			  '<div class="modal-body">'+
			  '</div>'+
			  '<div class="modal-footer">'+
				'<button type="button" class="btn btn-info" href="play.html" data-dismiss="modal">Play again</button>'+
				
			  '</div>'+
			'</div>'+
		  '</div>'+
		'</div>';
	// ensuite, insertion de la modale dans le flux HTML :
	document.querySelector('body').innerHTML+=flow;
	// affichage de la modale :
	$('#'+id).modal();
	// cablage des évenements pour redémarrer la partie ou en démarrer une nouvelle :
	$('#next').on('click',main);
	$('#same').on('click',replay);
}

// Gestion de la victoire
function win(){
	game_over = true;
	show_modal('modal_win','You won !');
}
function lose(){
	setTimeout(function(){ ("Hello"); }, 3000);
	show_modal('modal_win','You Lose')
}