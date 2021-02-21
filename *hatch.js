`use strict`;

function random_item(array) {
    let index = Math.floor(Math.random() * array.length);
    return array[index];
}

function random_name() {
    let sex = Math.random() > 0.5 ? `girl` : `boy`;
    return `${random_item(Faces[sex])} ${random_item(
        Names.first[sex]
    )} ${random_item(Names.last)}`;
}

function generate_name() {
    let name = random_name();
    while (Game.creeps[name]) {
        name = random_name();
    }
    return name;
}

class Hatch extends Asterisk {
    constructor(memory, kernel) {
        super(`hatch`, memory, kernel);
        this.memory.spawns = this.memory.spawns || [];

        this.memory.queued = this.memory.queued || {};
        this.queue = new Heap(`queue`, this.memory);
    }
    init() {
        this.update(`spawns`, Game.getObjectByName, `remove_name`);
    }
    run() {
        _.forEach(this.spawns, (spawn) => {
            let config = this.queue.top;
            if (config && spawn.hash.state == `idle`) {
                this.queue.pop();
                config.shift();
                config[2] = config[2] || generate_name();
                spawn.hash.assign(`spawnCreep`, config);
            }
        });
    }
    require(rank, body, role) {
        this.memory.queued[role] = this.queued(role) + 1;
        this.queue.push([Game.time + rank * 16, body, role]);
    }
    queued(role) {
        return this.memory.queued[role] || 0;
    }
}

module.exports = Hatch;
