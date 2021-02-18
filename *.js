`use strict`;

class Asterisk {
    constructor(name, memory, kernel) {
        this.memory = memory[`*${name}`] = memory[`*${name}`] || {};
        this.kernel = kernel;
        this.system = this.kernel.system;
    }
    update(group, derive, fail) {
        this[group] = _.reduce(
            this.memory[group],
            (rst, key) => {
                if (derive(key)) {
                    rst.push(derive(key));
                } else if (fail) {
                    this[fail](group, derive, key);
                }
                return rst;
            },
            []
        );
    }
    add(group, derive, object_key) {
        if (_.find(this.memory[group], (key) => key == object_key)) {
            throw new Error(`${object_key} exists in ${group}!`);
        } else {
            this.memory[group].push(object_key);
            this[group].push(derive(object_key));
        }
    }
    remove(group, derive, object_key) {
        _.remove(this.memory[group], (key) => key == object_key);
        this.update(group, derive);
    }
    add_name(group, creep) {
        this.add(group, Game.getObjectByName, creep.name);
    }
    remove_name(group, creep_name) {
        this.remove(group, Game.getObjectByName, creep_name);
    }
    add_id(group, structure) {
        this.add(group, Game.getObjectById, structure.id);
    }
    remove_id(group, structure_id) {
        this.remove(group, Game.getObjectById, structure_id);
    }
}

module.exports = Asterisk;
