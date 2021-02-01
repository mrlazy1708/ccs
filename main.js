`use strict`;

const System = require(`system`);
const Control_room = require("./control_room");

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
