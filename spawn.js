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

class Spawn extends Base {
    constructor(memory, kernel) {
        super(`spawn`, memory, kernel);
        this.memory.spawns = this.memory.spawns || [];

        this.memory.queued = this.memory.queued || {};
        this.spawn_queue = new Heap(`spawn_queue`, this.memory);
    }
    init() {
        this.update(`spawns`, Game.getObjectById, `remove_structure`);
    }
    run() {
        _.forEach(this.spawns, (spawn) => {
            let config = this.spawn_queue.top;
            if (config && spawn.entity.type == `idle`) {
                this.spawn_queue.pop();
                config.shift();
                config[2] = config[2] || generate_name();
                spawn.entity.assign(`spawnCreep`, config);
            }
        });
    }
    require(rank, body, role) {
        this.memory.queued[role] = this.queued(role) + 1;
        this.spawn_queue.push([Game.time + rank * 16, body, role]);
    }
    queued(role) {
        return this.memory.queued[role] || 0;
    }
}

module.exports = Spawn;
