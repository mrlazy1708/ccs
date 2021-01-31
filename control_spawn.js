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

class Control_spawn {
    constructor(memory, kernel) {
        this.memory = memory.control_spawn = memory.control_spawn || {
            spawns: [],
        };
        this.kernel = kernel;

        this.spawn_queue = new Heap(
            `spawn_queue`,
            this.memory,
            (sm1, sm2) => sm1[0] > sm2[0]
        );
    }
    init() {
        this.spawns = _.reduce(
            this.memory.spawns,
            (rst, name) => {
                let spawn = Game.spawns[name];
                if (spawn) {
                    rst.push(spawn);
                } else {
                    this.remove_spawn(name);
                }
                return rst;
            },
            []
        );
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
    add_spawn(spawn) {
        this.memory.spawns.push(spawn.name);
    }
    remove_spawn(spawn_name) {
        _.remove(this.memory.spawns, (name) => name == spawn_name);
        this.kernel.funeral.push(() => delete Memory.spawns[spawn_name]);
    }
}

module.exports = Control_spawn;
