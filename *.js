`use strict`;

class Asterisk {
    constructor(name, memory, kernel) {
        this.memory = memory[`*${name}`] = memory[`*${name}`] || {};
        this.kernel = kernel;
        this.system = this.kernel.system;
    }
    update(type, derive, fail) {
        this[type] = _.reduce(
            this.memory[type],
            (rst, key) => {
                if (derive(key)) {
                    rst.push(derive(key));
                } else if (fail) {
                    this[fail](type, derive, key);
                }
                return rst;
            },
            []
        );
    }
    add(type, derive, object_key) {
        if (_.find(this.memory[type], (key) => key == object_key)) {
            throw new Error(`${object_key} exists in ${type}!`);
        } else {
            this.memory[type].push(object_key);
            this.update(type, derive);
        }
    }
    remove(type, derive, object_key) {
        _.remove(this.memory[type], (key) => key == object_key);
        this.update(type, derive);
    }
    add_creep(type, creep) {
        this.add(type, Game.getCreepByName, creep.name);
    }
    remove_creep(type, creep_name) {
        this.remove(type, Game.getCreepByName, creep_name);
        this.kernel.funeral.push(() => delete Memory.creeps[creep_name]);
    }
    add_structure(type, structure) {
        this.add(type, Game.getObjectById, structure.id);
    }
    remove_structure(type, structure_id) {
        this.remove(type, Game.getObjectById, structure_id);
    }
    add_room(type, room) {
        this.add(type, Game.getRoomByName, room.name);
    }
    remove_room(type, room_name) {
        this.remove(type, Game.getRoomByName, room_name);
    }
}

module.exports = Asterisk;
