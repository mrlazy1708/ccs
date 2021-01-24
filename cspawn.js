`use strict`;

class Cspawn {
    constructor(memory, kernel) {
        this.memory = memory.cspawn = memory.cspawn || { spawns: [] };
        this.kernel = kernel;

        this.smh = new Heap(`smh`, this.memory, (sm1, sm2) => sm1[0] > sm2[0]);
    }
    init(memory) {
        this.memory = memory.cspawn;
        this.smh.init(this.memory);
    }
    run() {
        _.forEach(this.memory, (id) => {
            let config = this.smh.top;
            if (config) {
                let spawn = Game.getObjectById(id);
                if (spawn) {
                    let exec = this.kernel.oei[id];
                    if (!exec || exec.type == `idle`) {
                        this.smh.pop();
                        config.shift();
                        config[1] = config[1] || Math.random().toString();
                        this.kernel.execute(spawn.id, `spawnCreep`, config);
                    }
                }
            }
        });
    }
    add(id) {
        this.memory.spawns.push(id);
    }
}

module.exports = Cspawn;
