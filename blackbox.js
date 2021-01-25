`use strict`;

class Recorder {
    constructor(name, memory) {
        this.name = name;
        this.memory = memory[this.name] = memory[this.name] || {};

        this.memory.min = this.memory.min || 1e9;
        this.memory.max = this.memory.max || 0;
        this.memory.sum = this.memory.sum || 0;
        this.memory.tick = this.memory.tick || 0;
    }
    init(memory) {
        this.memory = memory[this.name];
    }
    reset() {
        this.memory = { min: 1e9, max: 0, sum: 0, tick: 0 };
    }
    run() {
        this.memory.tick++;
    }
    record(data) {
        this.memory.min = Math.min(this.min, data);
        this.memory.max = Math.max(this.max, data);
        this.memory.sum += data;
    }
    get min() {
        return this.memory.min;
    }
    get max() {
        return this.memory.max;
    }
    get sum() {
        return this.memory.sum;
    }
    get tick() {
        return this.memory.tick;
    }
    get average() {
        return this.sum / this.tick;
    }
}

class Blackbox {
    constructor(memory) {
        this.memory = memory.blackbox = memory.blackbox || {};

        this.cpu = new Recorder(`cpu`, this.memory);
        this.creep_num = new Recorder(`creep_num`, this.memory);
        this.creep_sum = new Recorder(`creep_sum`, this.memory);
    }
    init(memory) {
        this.memory = memory.blackbox;
        this.cpu.init(this.memory);
        this.creep_num.init(this.memory);
        this.creep_sum.init(this.memory);
    }
    reset() {
        this.cpu.reset();
        this.creep_num.reset();
        this.creep_sum.reset();
    }
    run() {
        this.cpu.run();
        this.cpu.record(Game.cpu.getUsed());

        this.creep_num.run();
        this.creep_num.record(_.keys(Game.creeps).length);

        this.creep_sum.run();
    }
}

module.exports = Blackbox;
