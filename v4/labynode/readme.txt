/* 21/03/2016 TP 4 NODE + Mongo */

@JL
// Installer Node, mongo et relier via express en ligne de commande (cf. tutoriel )

/**********************************************************************
Structure du répertoire du projet :
**********************************************************************
*bin* - c'est le système de génération de page, on n'a pas besoin d'y toucher.
*node_modules* - contient les outils node dont on est amené à se servir. On les installe via la console
              ->DOIT  contenir express, mongoose.
*package.json -> vérifiez que votre package.json contient les mêmes que le mien, sinon vous aller avoir des erreurs.

*models* - contient les schemas 
        -> c'est le modèle de DONNEES (en relationnel, ce sont les tables, ici ce sont des documents)

*public* - ce sont des éléments fournis au client: img, js, css.
*routes* - contient le système d'adressage des url (controleur)
*views* - les thèmes (vues) y sont stockés, scindés entre :
            -> les templates de pages
            -> et les 'partials' qui permettent de créer des bouts de page qu'on affichera dans certains ou tous les cas.
*app.js - c'est le fichier appelé dans tous les cas par l'application client serveur.

*utils.js - contient le 'framework' maison, une boite à outils utilisée sur ce projet.
*utils_tank.js - contient des tools pour aller plus loin...

***********************************************************************/
Dans quel ordre procéder :
/**********************************************************************
0. Insérer l'application développée coté client
> public : coller ici laby.js, les images utilisées et le css
> views : à minima, créer les fichier index.ejs, play.ejs, score.ejs à partir des vues développées précédemment
    - il est possible de scinder le contenu commun à toutes les pages (partials), sans oublier de les inclure.
    
1. Gestion utilisateurs
> models > users_model.js :  on y crée le schéma des utilisateurs
> app.js : appeler le modèle et la connexion à mongo
> routes > index.js : on a besoin de créer les chemins pour le login et le signup (get pour afficher la page et post pour récupérer les infos)
    - il faut aussi gérer l'enregistrement et le controle des utilisateurs

2. Gestion des scores
> public > javascripts > laby.js : on modifie notre fonction de scores pour qu'elle envoie en ajax le score du joueur au serveur
> routes > index.js : on crée un chemin pour le post d'un score et pour le get des scores
> views > scores.ejs : toujours en ajax, on récupére les scores pour les afficher dans le tableau

3. Mode multijoueur
> todo TP5 ;)

***********************************************************************/

/********************************************************************************
@FL
Les étapes du TP :
1. Mise en place de la gestion des utilisateurs (utilisateurs, administrateur).
2. Extension C/S de la gestion des scores.
3. Mise en place du gameplay multijoueur.

1. Mise en place de la gestion des utilisateurs
a) s'enregistrer, se connecter (mot de passe oublié), démarrer une partie en ligne, reprendre une partie en ligne

b) Parties - structure de données
	(1) Mode de jeu : les bonus et les malus, les bosses, buff,etc
	(2) Mode de jeu = façon dont on forme le score
	(3) Des joueurs en cours et de leur positions dans le jeu.
	(4) Nombre de joueurs

2. Extension C/S de la gestion des scores - Fonctionnalités à concevoir et réaliser
	1) Authentification et connexion.
	2) Visualisation des scores actuels de tous les joueurs en cours sur le côté de la fenêtre + actuellement connectés.
	3) Page scores : tous les scores de tous les joueurs pour toutes les parties
		a) Scores toutes parties confondues
		b) Sélectionner une partie donnée
		c) Voir les détails analytiques du score d’un joueur, globalement et en croisant avec une partie
	4) Objet JSON qui correspond au joueur:
		a) Le joueur
		b) Score global
		c) Score associé à des parties défi (plusieurs maps / serveurs / parties)
		d) Les parties en cours => rendre visible aux autres joueurs, la façon dont un bon joueur a construit son score
			i) La position actuelle
			ii) Le nombre de mouvements
			iii) Le nombre de murs pris (bump)
			iv) Le temps écoulé et le temps restant

3. Génération par le serveur d’une partie basée sur un labyrinthe immense.
- Déploiement : permettre aux joueurs enregistrés d’accéder à cette partie.
- Jouer : vue à la troisième personne, où chaque joueur voit la zone de labyrinthe qui l’entoure :
	concrètement, joueur fixé en centre page, et vue locale du labyrinthe qui scrolle en fonction des mouvements.
- Mettre en place la communication client serveur, multiclient :
	1. Le joueur arrive dans la partie sur une position initiale si début de partie, où à son ancienne position s’il reprend une partie en cours.
	2. Il visualise dans son environnement tous les autres joueurs, malus, bonus, etc situés dans cet environnement.

Notifications pull / push
	Pull 
		­ Lorsqu’il se déplace dans une direction donnée, le client adresse au serveur une requête pour récupérer un fragment de labyrinthe supplémentaire 
		qui correspond à un certain complément de surface de labyrinthe (caching), plutôt qu’une seule ligne ou colonne pour minimiser les AR client / serveur (coûteux).	
		- Dimensions de la zone téléchargée paramétrable (elle peut être relativement large). A PRECISER
		- Préciser le mécanisme de caching avec notamment le raccord des fragment pour maintenir le modèle du fragment local téléchargé (la zone visualisée + les alentours) + prévoir oubli quand on s’éloigne.	
	Push 
		­ Mettre en place la notification par le serveur des événement de mise à jour des
		éléments qui prennent dans la zone (autres joueurs, bonus, malus, etc).
		- Zoom sur les modèles de données échangées
		- Pull des fragments de labyrinthe : exactement le même modèle de donnée que pour
		représenter la labyrinthe complet, mais c’est un sous­labyrinthe défini relativement au
		principal par les classique position du coin NW et largeur et hauteur.
		

	Array.splice() Array.push() Array.pop() Array.shift() Array.unshift() Function.apply() 
    */