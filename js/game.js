/*jslint browser this */
/*global _, player, computer, utils */

(function () {
    "use strict";

    var game = {
        PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
        PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
        PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
        PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
        PHASE_GAME_OVER: "PHASE_GAME_OVER",
        PHASE_WAITING: "waiting",

        currentPhase: "",
        phaseOrder: [],
        // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur humain
        playerTurnPhaseIndex: 2,

        // l'interface utilisateur doit-elle être bloquée ?
        waiting: false,

        // garde une référence vers les noeuds correspondant du dom
        grid: null,
        miniGrid: null,

        // liste des joueurs
        players: [],

        // lancement du jeu
        init: function () {

            // initialisation
            this.grid = document.querySelector('.board .main-grid');
            this.miniGrid = document.querySelector('.mini-grid');

            // défini l'ordre des phase de jeu
            
            var message = confirm("Voulez-vous jouer en premier");

            if (message) {
                this.phaseOrder = [
                    this.PHASE_INIT_PLAYER,
                    this.PHASE_INIT_OPPONENT,
                    this.PHASE_PLAY_PLAYER,
                    this.PHASE_PLAY_OPPONENT,
                    this.PHASE_GAME_OVER
                ];
            } else {
                this.phaseOrder = [
                    this.PHASE_INIT_OPPONENT,
                    this.PHASE_INIT_PLAYER,
                    this.PHASE_PLAY_OPPONENT,
                    this.PHASE_PLAY_PLAYER,
                    this.PHASE_GAME_OVER
                ];
            }
            

            // initialise les joueurs
            this.setupPlayers();

            // ajoute les écouteur d'événement sur la grille
            this.addListeners();

            // c'est parti !
            this.goNextPhase();
        },
        setupPlayers: function () {
            // donne aux objets player et computer une réference vers l'objet game
            player.setGame(this);
            computer.setGame(this);

            // todo : implémenter le jeu en réseaux
            this.players = [player, computer];

            this.players[0].init();
            this.players[1].init();
        },
        goNextPhase: function () {
            // récupération du numéro d'index de la phase courante
            var ci = this.phaseOrder.indexOf(this.currentPhase);
            var self = this;

            if (ci !== this.phaseOrder.length - 1) {
                this.currentPhase = this.phaseOrder[ci + 1];
            } else {
                this.currentPhase = this.phaseOrder[this.playerTurnPhaseIndex];
            }

            switch (this.currentPhase) {
                
            case this.PHASE_GAME_OVER:
                // detection de la fin de partie
                if (!this.gameIsOver()) {
                    // le jeu n'est pas terminé on recommence un tour de jeu
                    self.goNextPhase();
                } else {
                    utils.info("Partie terminé");
                }
                break;
            
            case this.PHASE_INIT_PLAYER:
                utils.info("Placez vos bateaux");
                break;
            case this.PHASE_INIT_OPPONENT:
                this.wait();
                utils.info("En attente de votre adversaire");
                this.players[1].areShipsOk(function () {
                    self.stopWaiting();
                    self.goNextPhase();
                });
                break;
            case this.PHASE_PLAY_PLAYER:
                utils.info("A vous de jouer, choisissez une case !");
                break;
            case this.PHASE_PLAY_OPPONENT:
                utils.info("A votre adversaire de jouer...");
                this.players[1].play();
                break;
            }

        },
        gameIsOver: function () {
            
            var playerOneWin = true;
            var playerTwoWin = true;

            for (let i = 0; i < this.players[0].grid.length; i++) {
                for (let j = 0; j < this.players[0].grid[i].length; j++) {
                    if (this.players[0].grid[i][j] != 0) {
                        playerOneWin = false;
                    }
                }
            }
            for (let i = 0; i < this.players[1].grid.length; i++) {
                for (let j = 0; j < this.players[1].grid[i].length; j++) {
                    if (this.players[1].grid[i][j] != 0) {
                        playerTwoWin = false;
                    }
                }
            }      
            if (playerOneWin) {
                return playerOneWin;
            } else if (playerTwoWin){
                return playerTwoWin;
            } else {
                return false;
            }
        },
        getPhase: function () {
            if (this.waiting) {
                return this.PHASE_WAITING;
            }
            return this.currentPhase;
        },
        setPhase: function(phase){
            return this.currentPhase = phase;
        },
        // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
        wait: function () {
            this.waiting = true;
        },
        // met fin au mode mode "attente"
        stopWaiting: function () {
            this.waiting = false;
        },
        addListeners: function () {
            // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
            this.grid.addEventListener('mousemove', _.bind(this.handleMouseMove, this));
            this.grid.addEventListener('click', _.bind(this.handleClick, this));
        },
        handleMouseMove: function (e) {
            // on est dans la phase de placement des bateau
            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains('cell')) {
                var ship = this.players[0].fleet[this.players[0].activeShip];

                // si on a pas encore affiché (ajouté aux DOM) ce bateau
                if (!ship.dom.parentNode) {
                    this.grid.appendChild(ship.dom);
                    // passage en arrière plan pour ne pas empêcher la capture des événements sur les cellules de la grille
                    ship.dom.style.zIndex = -1;
                }

                // décalage visuelle, le point d'ancrage du curseur est au milieu du bateau
                ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60) + "px";
                ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
            }
        },
        handleClick: function (e) {
            // self garde une référence vers "this" en cas de changement de scope
            var self = this;

            // si on a cliqué sur une cellule (délégation d'événement)
            if (e.target.classList.contains('cell')) {
                // si on est dans la phase de placement des bateau
                if (this.getPhase() === this.PHASE_INIT_PLAYER) {
                    // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                    if (this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode))) {
                        // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)
                        if (!this.players[0].activateNextShip()) {
                            this.wait();
                            utils.confirm("Confirmez le placement ?", function () {
                                // si le placement est confirmé
                                self.stopWaiting();
                                self.renderMiniMap();
                                self.players[0].clearPreview();
                                self.goNextPhase();

                            }, function () {
                                self.stopWaiting();
                                // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                                self.players[0].resetShipPlacement();
                            });
                        }
                    }
                // si on est dans la phase de jeu (du joueur humain)
                } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
                    this.players[0].play(utils.eq(e.target), utils.eq(e.target.parentNode));
                }
            }
        },
        // fonction utlisée par les objets représentant les joueurs (ordinateur ou non)
        // pour placer un tir et obtenir de l'adversaire l'information de réusssite ou non du tir
        fire: function (from, col, line, callback) {
            this.wait();
            var self = this;
            var msg = "";

            var soundTouch = new Audio("touch.wav");
            var soundMiss = new Audio("miss.wav");
            var soundFire = new Audio("tir.wav")
            
            soundFire.play();
            setTimeout(() => {
                
            // determine qui est l'attaquant et qui est attaqué
            var target = this.players.indexOf(from) === 0
            ? this.players[1]
            : this.players[0];

        if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
            msg += "Votre adversaire vous a... ";
        }

        // on demande à l'attaqué si il a un bateaux à la position visée
        // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)
        target.receiveAttack(col, line, function (hasSucceed) {
            if (hasSucceed) {
                msg += "Touché !";
                soundTouch.play();

            } else {
                msg += "Manqué...";
                soundMiss.play();
            }

            if (game.currentPhase === game.PHASE_PLAY_PLAYER) {
                var cell = game.grid.querySelector('.row:nth-child(' + (line + 1 ) + ') .cell:nth-child(' + (col + 1) + ')');
                game.players[1].grid[line][col] = 0;
                if (cell.style.backgroundColor == "") {
                    if (hasSucceed) {
                        var image = new Image(60, 60);
                        image.src = "img/explosion.png";
                        cell.appendChild(image);
                        cell.style.backgroundColor = "red";
                        setTimeout(() => {
                            cell.removeChild(image);
                        }, 1000);
                    } else {
                        var image = new Image(60, 60);
                        image.src = "img/water_splash.png";
                        cell.appendChild(image);
                        cell.style.backgroundColor = "grey";
                        setTimeout(() => {
                            cell.removeChild(image);
                        }, 1000);
                    }
                } else {
                    msg = 'Case déjà cliqué';
                }

                
            } else {
                var cellOponent = game.miniGrid.querySelector('.row:nth-child(' + (line + 1 ) + ') .cell:nth-child(' + (col + 1) + ')');
                var positionShips = game.players[0].grid[line][col];
                if (hasSucceed) {
                    
                    console.log(game.players[0].fleet[3].life);

                    switch (positionShips) {
                        
                        case 1 :
                            game.players[0].grid[line][col] = 0;
                            console.log("bateau 1");
                            game.players[0].fleet[0].life += -1;
                            if (game.players[0].fleet[0].life === 0) {
                                document.querySelector('div.ship:nth-child(1)').classList.add("sunk");
                            }
                            break;

                        case 2 :
                            game.players[0].grid[line][col] = 0;
                            console.log("bateau 2");
                            game.players[0].fleet[1].life += -1;
                            if (game.players[0].fleet[1].life === 0) {
                                document.querySelector('div.ship:nth-child(2)').classList.add("sunk");
                            }
                            break;

                        case 3 :
                            game.players[0].grid[line][col] = 0;
                            console.log("bateau 3");
                            game.players[0].fleet[2].life += -1;
                            if (game.players[0].fleet[2].life === 0) {
                                document.querySelector('div.ship:nth-child(3)').classList.add("sunk");
                            }
                            break;

                        case 4 :
                            game.players[0].grid[line][col] = 0;
                            game.players[0].fleet[3].life += -1;
                            if (game.players[0].fleet[3].life === 0) {
                                document.querySelector('div.ship:nth-child(4)').classList.add("sunk");
                            }
                        break;
                    }

                    cellOponent.style.backgroundColor = "red";
                } 

                
            }

            utils.info(msg);

            // on invoque la fonction callback (4e paramètre passé à la méthode fire)
            // pour transmettre à l'attaquant le résultat de l'attaque
            callback(hasSucceed);

            // on fait une petite pause avant de continuer...
            // histoire de laisser le temps au joueur de lire les message affiché
            setTimeout(function () {
                self.stopWaiting();
                self.goNextPhase();
            }, 1000);
        });
            }, 1000);
            


        },
        renderMap: function () {
            this.players[0].renderTries(this.grid);
        },
        renderMiniMap: function () {
            this.miniGrid.innerHTML = this.grid.innerHTML;
        }
    };

    // point d'entrée
    document.addEventListener('DOMContentLoaded', function () {
        game.init();
    });

}());