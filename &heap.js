`use strict`;

class Heap {
    constructor(name, memory, predictor) {
        this.name = name;
        this.memory = memory[this.name] = memory[this.name] || [null];
        this.predictor = predictor || ((e1, e2) => e1[0] < e2[0]);
    }
    push(element) {
        this.memory.push(element);
        for (
            let i = this.memory.length - 1;
            i > 1 && this.predictor(this.memory[i], this.memory[i >> 1]);
            i >>= 1
        ) {
            [this.memory[i], this.memory[i >> 1]] = [
                this.memory[i >> 1],
                this.memory[i],
            ];
        }
    }
    pop() {
        if (this.memory.length <= 1) {
            return undefined;
        } else if (this.memory.length == 2) {
            return this.memory.pop();
        } else {
            let ret = this.memory[1];
            this.memory[1] = this.memory.pop();
            for (let i = 1; i << 1 < this.memory.length - 1; ) {
                if (
                    this.predictor(this.memory[i << 1], this.memory[i]) &&
                    this.predictor(
                        this.memory[i << 1],
                        this.memory[(i << 1) | 1]
                    )
                ) {
                    [this.memory[i], this.memory[i << 1]] = [
                        this.memory[i << 1],
                        this.memory[i],
                    ];
                    i = i << 1;
                } else if (
                    this.predictor(this.memory[(i << 1) | 1], this.memory[i])
                ) {
                    [this.memory[i], this.memory[(i << 1) | 1]] = [
                        this.memory[(i << 1) | 1],
                        this.memory[i],
                    ];
                    i = (i << 1) | 1;
                } else {
                    break;
                }
            }
            if (
                this.predictor(
                    this.memory[this.memory.length - 1],
                    this.memory[this.memory.length >> 1]
                )
            ) {
                [
                    this.memory[this.memory.length - 1],
                    this.memory[this.memory.length >> 1],
                ] = [
                    this.memory[this.memory.length >> 1],
                    this.memory[this.memory.length - 1],
                ];
            }
            return ret;
        }
    }
    get size() {
        return this.memory.length - 1;
    }
    get top() {
        return this.memory[1];
    }
}

module.exports = Heap;
