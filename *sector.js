`use strict`;

class Sector extends Asterisk {
    constructor(memory, kernel) {
        super(`sector`, memory, kernel);
        this.memory.rooms = this.memory.rooms || [];
        this.memory.sources = this.memory.sources || [];
        this.memory.sites = this.memory.sites || [];
    }
    init() {
        this.core = Game.getObjectByName(this.memory.core);
        this.update(`rooms`, Game.getObjectByName, `remove_room`);
        this.update(`sources`, Game.getObjectById, `remove_id`);
        this.update(`sites`, Game.getObjectById, `remove_id`);
    }
    plan_room(room) {
        this.system.graphic.erase(room.name);

        map.print();
        tree.print();
    }
    add_room(room) {
        this.add_name(`rooms`, room);

        let sources = room.find(FIND_SOURCES);
        _.forEach(sources, (source) => {
            let hash = this.kernel.get_hash(`Structures`, source);
            hash.memory.potential = source.pos.getReachability();
            this.add_id(`sources`, source);
        });

        let sites = room.find(FIND_MY_CONSTRUCTION_SITES);
        _.forEach(sites, (site) => this.add_id(`sites`, site));
    }
    remove_room(room_name) {
        let derive = (id) => {
            let object = Game.getObjectById(id); //monad
            if (object && object.room && object.room.name != room_name) {
                return object;
            }
        };
        this.remove_name(`rooms`, room_name);
        this.update(`sources`, derive, `remove_id`);
        this.update(`sites`, derive, `remove_id`);
    }
    set_core(core) {
        this.memory.core = core.name;
        this.core = core;
    }
}

module.exports = Sector;
