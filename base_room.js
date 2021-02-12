const Matrix = require("./matrix");

`use strict`;

class Base_room extends Base {
    constructor(memory, kernel) {
        super(`room`, memory, kernel);
        this.memory.rooms = this.memory.rooms || [];
        this.memory.sources = this.memory.sources || [];
    }
    init() {
        this.core = Game.getRoomByName(this.memory.core);
        this.update(`rooms`, Game.getRoomByName, `remove_room`);
        this.update(`sources`, Game.getObjectById, `remove_structure`);
    }
    plan_room(room) {
        let terrain = Matrix.from_terrain(room.getTerrain()),
            pref = terrain
                .to_path([room.controller])
                .zip_with(terrain.to_path(room.find(FIND_MINERALS)), Matrix.max)
                .zip_with(terrain.to_path(room.find(FIND_SOURCES)), Matrix.max)
                .zip_with(terrain.to_path(room.find(FIND_EXIT)), Matrix.div)
                .zip_with(terrain.to_square(), Matrix.div),
            center = pref.poi();
        center = new RoomPosition(center[0], center[1], room.name);

        this.system.graphic.erase(room.name);
        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                this.system.graphic.draw(room.name, `plan`, `circle`, x, y, {
                    radius: 0.1 / pref.get(x, y),
                });
            }
        }
    }
    add_room(room) {
        this.add(`rooms`, Game.getRoomByName, room.name);

        let sources = room.find(FIND_SOURCES);
        _.forEach(sources, (source) => {
            let entity = this.kernel.new_entity(source);
            entity.memory.potential = source.pos.getReachability();
            this.add(`sources`, Game.getObjectById, source.id);
        });
    }
    set_core(core) {
        this.memory.core = core.name;
        this.core = core;
    }
    remove_room(room_name) {
        this.remove(`rooms`, Game.getRoomByName, room_name);
        this.update(`sources`, Game.getObjectByName, this.remove_structure);
    }
}

module.exports = Base_room;
