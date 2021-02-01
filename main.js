`use strict`;

const System = require(`system`);

// delete Memory.ccs;
console.log(`restart!`);

global.system = new System(`ccs`);

module.exports.loop = function () {
    Game.reset = function () {
        delete Memory.ccs;
        system = new System(`ccs`);
        _.forEach(Game.rooms, (room) => {
            if (room.controller && room.controller.my) {
                system.new_kernel(room);
            }
        });
    };
    try {
        system.init();
        system.run();
        system.shut();
    } catch (err) {
        console.log(err);
        Game.reset();
    }
};
