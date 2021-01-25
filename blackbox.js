`use strict`;

class Recorder {
    constructor(name, memory) {
        this.name = name;
        this.memory = memory[this.name] = memory[this.name];

        this.memory.min = this.memory.min || 0;
        this.memory.max = this.memory.max || 0;
        this.memory.sum = this.memory.sum || 0;
        this.memory.tick = this.memory.tick || 0;
    }
    init(memory) {
        this.memory = memory[this.name];
    }
    reset() {
        this.memory = { min: 0, max: 0, sum: 0, tick: 0 };
    }
    run() {
        this.memory.tick++;
    }
    record(data) {
        this.memory.min = min(this.min, data);
        this.memory.max = max(this.max, data);
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
    run() {
        this.cpu.run();
        this.cpu.record(Game.creeps.length);

        this.creep_num.run();
        this.creep_sum.run();
    }
}

module.exports = Blackbox;
