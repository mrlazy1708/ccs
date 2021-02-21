`use strict`;

class Traffic extends Asterisk {
    constructor(memory, kernel) {
        super(`traffic`, memory, kernel);

        this.tree = new Tree(`tree`, this.memory);
    }
}

module.exports = Traffic;
