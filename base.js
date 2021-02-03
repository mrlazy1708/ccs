`use strict`;

class Base {
    constructor(name, memory, kernel) {
        this.memory = memory[`base_${name}`] = memory[`base_${name}`] || {};
        this.kernel = kernel;
    }
    update(type, derive, fail) {
        this[type] = _.reduce(
            this.memory[type],
            (rst, key) => {
                if (derive(key)) {
                    rst.push(derive(key));
                } else {
                    fail(key);
                }
                return rst;
            },
            []
        );
    }
    add_creep(type, creep) {
        if (_.find(this.memory[type], (name) => name == creep.name)) {
            throw new Error(`creep ${creep.name} exists!`);
        }
        this.memory[type].push(creep.name);

        this.update(type, Game.getCreepByName, this.remove_creep);
    }
    remove_creep(type, creep_name) {
        _.remove(this.memory[type], (name) => name == creep_name);
        this.kernel.funeral.push(() => delete Memory.creeps[jack_name]);

        this.update(type, Game.getCreepByName, this.remove_creep);
    }
    add_structure(type, structure) {
        if (_.find(this.memory[type], (id) => id == structure.id)) {
            throw new Error(`structure ${structure.id} exists!`);
        }
        this.memory[type].push(structure.id);

        this.update(type, Game.getObjectById, this.remove_structure);
    }
    remove_structure(type, structure_id) {
        _.remove(this.memory[type], (id) => id == structure_id);
        this.kernel.funeral.push(() => {});

        this.update(type, Game.getObjectById, this.remove_structure);
    }
    add_room(type, room) {
        if (_.find(this.memory[type], (name) => name == room.name)) {
            throw new Error(`room ${room.name} exists!`);
        }
        this.memory[type].push(room.name);

        this.update(type, Game.getRoomByName, this.remove_room);
    }
    remove_room(type, room_name) {
        _.remove(this.memory[type], (name) => name == room_name);
        this.kernel.funeral.push(() => {});

        this.update(type, Game.getRoomByName, this.remove_room);
    }
}

module.exports = Base;
