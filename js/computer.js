/*jslint browser this */
/*global _, player */

(function (global) {
    "use strict";
    var computer = _.assign({}, player, {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        play: function () {
            var self = this;
            setTimeout(function () {
                
                var nbr1 = Math.floor(Math.random() * Math.floor(9));
                var nbr2 = Math.floor(Math.random() * Math.floor(9));

                self.game.fire(this, nbr1, nbr2, function (hasSucceed) {
                    self.tries[nbr1][nbr2] = hasSucceed;
                
                });
            }, 2000);
        },
        areShipsOk: function (callback) {

            self = this;
            var index = 0;
            self.fleet.forEach(function setShip(ship) {

                var life = 0;
                var canPutShip = true;
                var middle = Math.floor(ship.getLife() / 2);
                var middleLeft = ship.getLife() / 2 ;

                if (ship.name == "Submarine") {
                    var i = Math.floor(Math.random() * 8) + 2;
                    var j = Math.floor(Math.random() * 9);
                } else {
                    var i = Math.floor(Math.random() * (9 - middle)) + middle;
                    var j = Math.floor(Math.random() * 9);
                }

                while (life < ship.getLife()) {
                    
                    if (ship.getLife() % 2 == 0) {

                        if(self.grid[i][j - middleLeft + life] != 0 || self.grid[i][j - middleLeft + life] === undefined){

                            canPutShip = false;
                        }
                    } else {

                        if (self.grid[i][j - middle + life] != 0 || self.grid[i][j - middle + life] === undefined) {
                            canPutShip = false;

                        }
                    }

                    life++;
                }

                life = 0;

                if (canPutShip) {
                    while (life < ship.getLife()) {
                        if (ship.getLife() % 2 == 0) {
                            self.grid[i][j - middleLeft + life] = ship.getId();
                        } else {
                            self.grid[i][j - middle + life] = ship.getId();
                        }
    
                        life++;
                    }
                } else {
                    setShip(ship);
                }


            }, this);
            setTimeout(function () {
                callback();
            }, 500);
        }
    });

    global.computer = computer;

}(this));