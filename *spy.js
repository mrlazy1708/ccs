`use strict`;

class Spy extends Asterisk {
    constructor(memory, kernel) {
        super(`spy`, memory, kernel);
        this.memory.spies = this.memory.spies || [];

        this.queue = new Heap(`queue`, this.memory);
    }
    init() {
        this.update(`spies`, Game.getObjectByName, `remove_name`);
    }
    run() {
        _.forEach(this.spies, (spy) => {
            let mission = this.queue.top;
            if (mission && spy.hash.type == `idle`) {
                this.queue.pop();
                spy.hash.assign(mission[1], mission[2]);
            }
        });
        if (this.queue.size > this.kernel.hatch.queued(`spy`)) {
            this.kernel.hatch.require(1, [MOVE], `spy`);
        }
    }
}

module.exports = Spy;
