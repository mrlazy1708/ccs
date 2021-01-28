`use strict`;

class Control_room {
    constructor(memory, kernel) {
        this.memory = memory.control_room = memory.control_room || {
            core: null,
            rooms: [],
            sources: [],
        };
        this.kernel = kernel;
    }
    init(memory) {
        this.memory = memory.control_room;
        this.core = Game.rooms[this.memory.core];
        this.rooms = _.map(this.memory.rooms, (name) => Game.rooms[name]);
        this.sources = _.map(this.memory.sources, (id) =>
            Game.getObjectById(id)
        );
    }
    add_room(room) {
        this.memory.rooms.push(room.name);
        this.rooms.push(room);

        let sources = room.find(FIND_SOURCES);
        _.forEach(sources, (source) => this.memory.sources.push(source.id));
        _.forEach(sources, (source) => this.sources.push(source));
    }
    set_core(core) {
        if (this.core) {
            this.add_room(this.core);
        }

        this.memory.core = core.name;
        this.core = core;
    }
    remove_room(room_name) {
        _.remove(this.memory.rooms, (name) => name == room_name);
        _.remove(this.rooms, (room) => !room || room.name == room_name);

        _.remove(
            this.memory.sources,
            (id) =>
                !Game.getObjectById(id) ||
                Game.getObjectById(id).pos.roomName == room_name
        );
        _.remove(
            this.sources,
            (source) => !source || source.pos.roomName == room_name
        );
    }
}

module.exports = Control_room;
