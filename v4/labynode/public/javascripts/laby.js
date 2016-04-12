/*
	(c) Platypus SAS 2015-2016
	Release version - v2
	Author - Jules & Franck Lepoivre
	Release date - 2016/03/04 - TP 2 ESILV 2A ACS - Labyrinthes
*/

const wsz = 5;			// épaisseur d'un mur
const psz = 0.5;			// épaisseur d'une porte
var csz = 50;			// côté d'une cellule
//var laby;				// le labyrinthe
var limits = {}			// limites du labyrinthe
var entry_pos = [];		// entrée du labyrinthe
var exit_pos = [];		// sortie du labyrinthe
var labyscores = []; 	// tableau des scores
var player1 = {};		// joueur 1
player1.pos = [];		// position du joueur1
player1.score = {};		// score du joueur 1
var game_over = true;	// fin du jeu
var tm, txt_timer;		// compte à rebours
var monsters = [];		// monstres
var monster_behav = 0;	// comportement des monstres
var timeset;
// Affichage du labyrinthe et de ses murs, et du joueur
function print_maze(a,nb_monsters) {
    var i, j;
	var maze = document.querySelector('#maze');
	// Vider la div maze
	while (maze.hasChildNodes()) {
		maze.removeChild(maze.lastChild);
	};
	// Appliquer au labyrinthe des styles selon les paramètres entrés par l'utilisateur
	maze.setAttribute('style', 'width:' + (csz * a[0].length) + 'px; height:' + (csz * a.length) + 'px;');
	maze.setAttribute('class','maze');
	for (var i = 0; i < a.length; i++) {
		for (j = 0; j < a[i].length; j++) {
			var div = document.createElement('div');
			div.setAttribute('id',i + "_" + j);
			div.setAttribute('class','cell ' + css_cell_code(a[i][j]) );
			div.setAttribute('style', ' top:'+ (csz * i) + '; left:' + (csz * j) + '; width:'+csz+'px; height:'+csz+'px;');
			maze.appendChild(div);
		}
	}
	
	
	// Dessiner les intersections
	for (var i = 1; i < a.length; i++) {
		for (j = 1; j < a[i].length; j++) {
			var div = document.createElement('div');
			div.setAttribute('id','_' + i + "_" + j);
			div.setAttribute('class','cell_intersect');
			div.setAttribute('style','top:'+ (csz * i - wsz) + "; left:" + (csz * j - wsz) + ";");
			maze.appendChild(div);
		}
	}
	
	
	// En début de partie, le joueur est matérialisé sur la cellule d’entrée du labyrinthe :
	var user = document.createElement('div');
	user.setAttribute('id','user');
	user.setAttribute('style',"top:" + (csz * player1.pos[0]) + "; left:" + (csz * player1.pos[1]) + "; width:" + csz + "px; height:" + csz + "px;");
	user.style.backgroundSize = csz+'px';
	maze.appendChild(user);
	
	// Marquage de la sortie :
	for (var i = 0; i < a.length && has_E_wall(a[i][a[0].length - 1]); i++);
	document.getElementById(i + "_" + (a[0].length - 1)).style.backgroundColor = "#ff6666";
	exit_pos = [i,a[0].length - 1];
	
	// Marquage de la position des monstres :
	for (var j = 0; j < nb_monsters; j++){
		var monster = document.createElement('div');
		monster.setAttribute('id','monster'+j);
		monster.setAttribute('class','monster');
		monster.setAttribute('style','top:'+csz*monsters[j][0]+"; left:"+csz*monsters[j][1]+";width:"+csz+"px; height:"+csz+"px;");
		maze.appendChild(monster);
	}
}

// Lancement d'une partie
function new_game(x,y,time,nb_monsters,rep) {
	player1.score = {};
	player1.score.bump = 0;
	player1.moves = 0;
	player1.score.points = x*y;
	limits.top = 0;
	limits.left = 0;
	limits.bot = x;
	limits.right = y;
	
	document.querySelector('#score1').innerHTML = player1.score.points;
	if (rep){
		laby = new_2d_array(x, y);
		init_2d_array(laby, 15);
		dig(laby, 0, 0);
		dig_ES(laby);
		place_monsters(laby,nb_monsters);
	}
	//modifyStyleSheet();
	set_timer(time);
	player1.pos[0] = entry_pos[0];
	player1.pos[1] = entry_pos[1];
	print_maze(laby, nb_monsters);	
}

/*
- Ajouter un timer qui indique au joueur son temps restant
*/
function set_timer(time){
	// Initialisation du compte à rebours
	tm = setTimeout(function(){
		// Quand le timer tombe à 0, la partie est terminée, et un message qui le manifeste s’affiche. Le jeu est alors bloqué
		lose();
	},time*1000);
	// Affichage du compte à rebours
	txt_timer = setInterval(function(){
		if (document.querySelector('#timer1')) document.querySelector('#timer1').innerHTML = --time;
		else clearInterval(txt_timer);
		if (time == 0) clearInterval(txt_timer);
	},1000);
}

// Initialisation du labyrinthe
//todo: récupérer le laby depuis le serveur
function main(){
	// Récupération des variables saisies par l'utilisateur
	csz = 50;//document.querySelector('#csz').value;
	var x = 5;//parseInt(document.querySelector('#x').value);
	var y = 5;//parseInt(document.querySelector('#y').value);
	var time = 120;//document.querySelector('#time');
	timeset = time;
    //time = time.options[time.selectedIndex].value;
	var nb_monsters = 3;//parseInt(document.querySelector('#nb_monsters').value);
	monster_behav = 0;//document.querySelector('#monster_behavior').options[document.querySelector('#monster_behavior').selectedIndex].value;
	// Enlever le footer pour avoir une zone de jeu plus grande :
	document.querySelector('footer').style.visibility='hidden';
    
    //todo : modifier avec l'user enregistré
	if (!player1.name) player1.name = 'Player1' || document.querySelector('#p_name').value;
	// Lancement du jeu
	new_game(x,y,time,nb_monsters,game_over);	
	game_over = false;
	// Gestion de l'affichage des informations
	document.querySelector('#timer1').innerHTML = time;
	document.querySelector('#aside').style.visibility='visible';
	document.querySelector('#name1').innerHTML = player1.name;
	// Récupération de l'enregistrement des scores en local
	if ((localStorage.labyscores != null)&&(localStorage.labyscores.length != 0)&&(localStorage.labyscores !='[]')) labyscores = JSON.parse(localStorage.labyscores);	
}

// Ajout de la possibilité de rejouer la partie en cours (reset), qui repositionne le joueur sur la position d'entrée du même laby et réinitialise le compte à rebours
function replay(){
	game_over = false;
	main();
}

// Fonction évenementielle principale
function uniKeyCode(event) {
	var key = event.keyCode;
	if(!document.getElementById("user")||(game_over)||(key != 37 && key != 38 && key != 39 && key != 40)) return;
	//déplacement du joueur
	move_player(key);
	//console.log('player '+player1.pos[0]+' '+player1.pos[1]);
	player1.moves++;
	document.querySelector('#score1').innerHTML = player1.score.points - player1.moves - 100*player1.score.bump;
	// Vérifier les conditions de victoire
	if ((player1.pos[0] == exit_pos[0])&&(player1.pos[1] == exit_pos[1])) return win();
	//déplacement des monstres
	move_monsters();
}

function move_player(key){
	var user_style = document.getElementById("user").style;
    switch (key) {
    	case 37 : // W
    		if ((!has_W_wall(laby[player1.pos[0]][player1.pos[1]]))&&(player1.pos[1]>limits.left)) {
    			player1.pos[1]--;
    			user_style.left = (csz * player1.pos[1]) + "px";
    		}
    		else player1.score.bump++;
    		break;
		case 38 : // N
    		if ((!has_N_wall(laby[player1.pos[0]][player1.pos[1]]))&&(player1.pos[0]>limits.top)) {
    			player1.pos[0]--;
    			user_style.top = (csz * player1.pos[0]) + "px";
    		}
    		else player1.score.bump++;
    		break;
    	case 39 : // E
    		if ((!has_E_wall(laby[player1.pos[0]][player1.pos[1]]))&&(player1.pos[1]<limits.right)) {
    			player1.pos[1]++;
    			user_style.left = (csz * player1.pos[1]) + "px";
    		}
    		else player1.score.bump++; 
    		break;
    	case 40 : // S
    		if ((!has_S_wall(laby[player1.pos[0]][player1.pos[1]]))&&(player1.pos[0]<limits.bot)) {
    			player1.pos[0]++;
    			user_style.top = (csz * player1.pos[0]) + "px";
    		}
    		else player1.score.bump++;
    		break;
    }
}

function check_pos_player_monster(i){
	//vérifier si le joueur est sur la même case que le monstre
	if((player1.pos[0] == monsters[i][0])&&(player1.pos[1] == monsters[i][1])) {
		if (monster_behav == 1) return lose();
		if (monster_behav == 2) return fight();
	}
}

function move_monsters(){
	// Déplacer les monstres
	for (var i = 0; i <monsters.length;i++){
		// on vérifie si le joueur rencontre un monstre, avant et après le déplacement
		check_pos_player_monster(i);
		move_monster(i);
		check_pos_player_monster(i);
	}
	//if (monsterpass > 0) monsterpass--;
}
	
function move_monster(i){
	var monster_style = document.querySelector('#monster'+i).style;
	//tirage d'une direction aléatoire (N, S, E ou W)
	var dir = Math.floor(Math.random()*4)+1;
	switch(dir) {
		case 1 : // W
			if ((!has_W_wall(laby[monsters[i][0]][monsters[i][1]]))&&(monsters[i][1]>limits.left)){
				monsters[i][1]--; 
				monster_style.left = (csz * monsters[i][1]) + "px";
			} else move_monster(i);
			break;
		case 2 : // N
			if ((!has_N_wall(laby[monsters[i][0]][monsters[i][1]]))&&(monsters[i][0]>limits.top)){
				monsters[i][0]--; 
				monster_style.top = (csz * monsters[i][0]) + "px";
			} else move_monster(i);
			break;
		case 3 : // E
			if ((!has_E_wall(laby[monsters[i][0]][monsters[i][1]]))&&(monsters[i][1]<limits.right)){
				//si un monstre est sur la sortie et sort du labyrinthe, on l'efface
				if ((monsters[i][0] == exit_pos[0])&&(monsters[i][1] == exit_pos[1])) return kill_monster(i);
				monsters[i][1]++; 
				monster_style.left = (csz * monsters[i][1]) + "px";
			} else move_monster(i);
			break;
		case 4 : // S
			if ((!has_S_wall(laby[monsters[i][0]][monsters[i][1]]))&&(monsters[i][0]<limits.bot)){
				monsters[i][0]++; 
				monster_style.top = (csz * monsters[i][0]) + "px";
			} else move_monster(i);
			break;
	}
}

function kill_monster(i){
	monsters.splice(i,1);
	document.querySelector('#maze').removeChild(document.querySelector('#monster'+i));
}

function fight(){
	var flow =
		'<div id="fight_modal" class="modal fade" role="dialog">'+
		  '<div class="modal-dialog">'+
			'<div class="modal-content">'+
			  '<div class="modal-header">'+
				'<h4 class="modal-title">Fight !</h4>'+
			  '</div>'+
			  '<div class="modal-body">'+
				'<p>You encountered a monster ! Your only way out is to fight...</p>'+
				//todo: stopper le timer pendant le combat
				//todo: résoudre le combat
			  '</div>'+
			  '<div class="modal-footer">'+
			  '</div>'+
			'</div>'+
		  '</div>'+
		'</div>';
		document.querySelector('body').innerHTML+=flow;
		// affichage de la modale :
		$('#fight_modal').modal({backdrop: 'static', keyboard: false});
}

// Fonction générique d'affichage d'une modale pour la fin de la partie.
function show_modal(id,title){
	if (monster_behav == 1) var beh = 'Game Over'; else var beh = 'Fight';
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
			  '<p>Dimensions : '+player1.score.points/10+'</p>'+
			  '<hr/>'+
			  '<p>Moves : '+player1.moves+'</p>'+
			  '<p>Walls Bumped : '+player1.score.bump+'</p>'+
			  '<hr/>'+
			  '<p>Initial time : '+player1.score.time+'</p>'+
			  '<p>Elapsed time : '+player1.score.elapsed+'</p>'+
			  '<p>Left time : '+player1.score.left+'</p>'+
			  '<hr/>'+
			  '<p>Number of monsters : '+monsters.length+'</p>'+
			  '<p>Behavior of monsters : '+beh+'</p>'+
			  '<h3>Final score : '+player1.score.total+'</h3>'+
			  '</div>'+
			  '<div class="modal-footer">'+
				'<button type="button" id="same" class="btn btn-info" data-dismiss="modal">Play again</button>'+
				'<button type="button" id="next" class="btn btn-info" data-dismiss="modal">New game</button>'+
			  '</div>'+
			'</div>'+
		  '</div>'+
		'</div>';
	// ensuite, insertion de la modale dans le flux HTML :
	document.querySelector('body').innerHTML+=flow;
	// affichage de la modale :
	$('#'+id).modal();
	// cablage des évenements pour redémarrer la partie ou en démarrer une nouvelle :
	$('#next').on('click',function(){
		$('#modal_init').modal();}
		
	);
	$('#same').on('click',replay);
}

// Gestion de la victoire
function win(){
	game_over = true;
	scores(true);
	clearInterval(txt_timer);
	clearTimeout(tm);
	show_modal('modal_win','You won !');
}

// Gestion de la défaite
function lose(){
	game_over = true;
	clearInterval(txt_timer);
	scores(false);
	show_modal('modal_game_over','Game Over!');
}

/*
	Gestion des scores : 
	- une somme de points fixe, à laquelle on décrémente le nombre de déplacements du joueur. 
	- corréler le nombre de points gagnés à la taille du labyrinthe et à la durée du timer
	v1 : finalscore = 10 xy - moves -  - 100*bump - 5 * time - 10 elapsed_time + 5 * time_left
	v2 : finalscore = 10 xy - moves -  - 100*bump - 5 * time - 10 elapsed_time + 5 * time_left + nb_monsters * 100
*/
function scores(win){
	player1.score.time = timeset;
	player1.score.elapsed = player1.score.time - parseInt(document.querySelector('#timer1').innerHTML);
	player1.score.left = player1.score.time - player1.score.elapsed;
	player1.score.points = 10*parseInt(limits.bot)*parseInt(limits.right);
	if (win){
		player1.score.total = player1.score.points;
		player1.score.total -= player1.moves; 
		player1.score.total -= 100*player1.score.bump;
		player1.score.total = player1.score.total - 5*player1.score.time + 5*player1.score.left - 10*player1.score.elapsed;
		player1.score.total += monsters.length*100/monster_behav;
		if (!player1.score.bonus) player1.score.bonus = 0;
		if (!player1.score.malus) player1.score.malus = 0;
		player1.score.total = player1.score.total + player1.score.bonus * 100 - player1.score.malus * 100;
		// Enregistrement des scores en local :
		labyscores[labyscores.length] = {name:player1.name,score:player1.score.total,dim:player1.score.points/10,moves:player1.moves,bumps:player1.score.bump,time:player1.score.time,left:player1.score.left, monsters:monsters.length, behav:monster_behav, bonus:player1.score.bonus, malus:player1.score.malus};
		localStorage.labyscores = JSON.stringify(labyscores);
        
        // Enregistrer les scores coté serveur:
         $.ajax({
            type:'POST',
            url: "/score",
            data:JSON.stringify(player1.score),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
         }).done(function(data) {
            
         }).fail(function(req,text_status,err){
            
        });     
	} else player1.score.total = 0;
	
	
}