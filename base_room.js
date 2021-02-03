`use strict`;

class Base_room {
    constructor(memory, kernel) {
        this.memory = memory.base_room = memory.base_room || {
            core: null,
            rooms: [],
            sources: [],
        };
        this.kernel = kernel;
    }
    init() {
        this.core = Game.rooms[this.memory.core];
        this.rooms = _.map(this.memory.rooms, (name) => Game.rooms[name]);
        this.sources = _.map(this.memory.sources, (id) =>
            Game.getObjectById(id)
        ); //funeral?
    }
    add_room(room) {
        if (_.find(this.memory.rooms, (name) => name == room.name)) {
            throw new Error(`room ${room.name} exists in ${this.kernel.name}!`);
        }
        this.memory.rooms.push(room.name);

        let sources = room.find(FIND_SOURCES);
        _.forEach(sources, (source) => {
            this.memory.sources.push(source.id);
            let entity = this.kernel.new_entity(source);
            entity.memory.potential = source.pos.getReachability();
        });

        this.init();
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

        this.init();
    }
}

module.exports = Base_room;
