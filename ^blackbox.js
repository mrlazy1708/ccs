`use strict`;

class Blackbox {
    constructor(name, memory) {
        this.name = name;
        this.memory = memory[this.name] = memory[this.name] || {};

        this.memory.min = this.memory.min || 1e9;
        this.memory.max = this.memory.max || 0;
        this.memory.sum = this.memory.sum || 0;
        this.memory.ticks = this.memory.ticks || 0;
    }
    reset() {
        this.memory = { min: 1e9, max: 0, sum: 0, ticks: 0 };
    }
    tick() {
        this.memory.ticks++;
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
    get ticks() {
        return this.memory.ticks;
    }
    get average() {
        return this.sum / this.ticks;
    }
}

module.exports = Blackbox;
