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
    init(memory) {
        this.memory = memory.control_spawn;
        this.spawn_queue.init(this.memory);
    }
    run() {
        _.forEach(this.memory, (id) => {
            let config = this.spawn_queue.top;
            if (config) {
                let spawn = Game.getObjectById(id);
                if (spawn) {
                    let exec = this.kernel.executions[id];
                    if (!exec || exec.type == `idle`) {
                        this.spawn_queue.pop();
                        config.shift();
                        config[1] = config[1] || generate_name();
                        this.kernel.execute(spawn.id, `spawnCreep`, config);
                    }
                }
            }
        });
    }
    add_spawn(spawn) {
        this.memory.spawns.push(spawn.id);
    }
}

module.exports = Control_spawn;
