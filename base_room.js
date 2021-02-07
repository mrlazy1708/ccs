`use strict`;

class Base_room extends Base {
    constructor(memory, kernel) {
        super(`room`, memory, kernel);
        this.memory.rooms = this.memory.rooms || [];
        this.memory.sources = this.memory.sources || [];
    }
    init() {
        this.core = Game.getRoomByName(this.memory.core);
        this.update(`rooms`, Game.getRoomByName, this.remove_room);
        this.update(`sources`, Game.getObjectById, this.remove_structure);
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
