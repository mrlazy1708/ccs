`use strict`;

class Spy extends Base {
    constructor(memory, kernel) {
        super(`spy`, memory, kernel);
        this.memory.spies = this.memory.spies || [];

        this.mission_queue = new Heap(`mission_queue`, this.memory);
    }
    init() {
        this.update(`spies`, Game.getCreepByName, `remove_creep`);
    }
    run() {
        _.forEach(this.spies, (spy) => {
            let mission = this.mission_queue.top;
            if (mission && spy.entity.type == `idle`) {
                this.mission_queue.pop();
                spy.entity.assign(mission[1], mission[2]);
            }
        });
        if (this.mission_queue.size > this.kernel.spawn.queued(`spy`)) {
            this.kernel.spawn.require(1, [MOVE], `spy`);
        }
    }
}

module.exports = Spy;