/*jslint browser this */
/*global _, shipFactory, player, utils */

(function (global) {
    "use strict";

    var sheep = {dom: {parentNode: {removeChild: function () {}}}};

    var player = {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        activeShip: 0,
        init: function () {
            // créé la flotte
            this.fleet.push(shipFactory.build(shipFactory.TYPE_BATTLESHIP));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_DESTROYER));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SUBMARINE));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SMALL_SHIP));

            // créé les grilles
            this.grid = utils.createGrid(10, 10);
            this.tries = utils.createGrid(10, 10);
        },
        play: function (col, line) {
            // appel la fonction fire du game, et lui passe une calback pour récupérer le résultat du tir
            this.game.fire(this, col, line, _.bind(function (hasSucceed) {
                this.tries[line][col] = hasSucceed;
            }, this));
        },
        // quand il est attaqué le joueur doit dire si il a un bateaux ou non à l'emplacement choisi par l'adversaire
        receiveAttack: function (col, line, callback) {
            var succeed = false;
            
            if (this.grid[line][col] !== 0) {
                succeed = true;
                
                //this.grid[line][col] = 0;

            }

            //console.log(succeed);
            callback.call(undefined, succeed);
        },
        setActiveShipPosition: function (x, y) {
            
            var ship = this.fleet[this.activeShip];
            var middle = Math.floor(ship.getLife() / 2);
            var middleLeft = ship.getLife() / 2 ;
            var middleRight = ship.getLife() / 2 - 1;

            var i = 0;

            while (i < ship.getLife()) {

                if (ship.getLife() % 2 == 0) {
                    if (this.grid[y][x - 2 + i] != ship.getId() && this.grid[y][x - 2 + i] != 0) {
                        return false;
                    }
                } else {
                    if (this.grid[y][x - middle + i] != ship.getId() && this.grid[y][x - middle + i] != 0) {
                        return false;
                    }
                }
                this.grid[y][x - middle + i] = ship.getId();
                i += 1;
            }

            if (ship.getLife() % 2 == 0) {
                if (x - middleLeft >= 0 && x + middleRight <= 9) {
                    return true;
                } else {
                    return false;
                }
            } else {
                if (x - middle >= 0 && x + middle <= 9) {
                    return true;
                } else {
                    return false;
                }
            }

        },
        clearPreview: function () {
            this.fleet.forEach(function (ship) {
                if (ship.dom.parentNode) {
                    ship.dom.parentNode.removeChild(ship.dom);
                    
                }
            });
        },
        resetShipPlacement: function () {
            this.clearPreview();

            this.activeShip = 0;
            this.grid = utils.createGrid(10, 10);
        },
        activateNextShip: function () {
            if (this.activeShip < this.fleet.length - 1) {
                this.activeShip += 1;
                return true;
            } else {
                return false;
            }
        },
        renderTries: function (grid) {
            this.tries.forEach(function (row, rid) {
                row.forEach(function (val, col) {
                    var node = grid.querySelector('.row:nth-child(' + (rid + 1) + ') .cell:nth-child(' + (col + 1) + ')');

                    if (val === true) {
                        node.style.backgroundColor = '#e60019';
                    } else if (val === false) {
                        node.style.backgroundColor = '#aeaeae';
                    }
                });
            });
        },
        renderShips: function (grid) {
        },
        setGame: function(game) {
            this.game = game;
        },
        isShipOk(game){
        }
    };

    global.player = player;

}(this));