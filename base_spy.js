`use strict`;

class Base_spy extends Base {
    constructor(memory, kernel) {
        super(`spy`, memory, kernel);
        this.memory.spies = this.memory.spies || [];
        this.memory.queued = this.memory.queued || 0;

        this.mission_queue = new Heap(
            `mission_queue`,
            this.memory,
            (mission_1, mission_2) => mission_1[0] < mission_2[0]
        );
    }
    init() {
        this.update(`spies`, Game.getCreepByName, this.remove_creep);
    }
    run() {
        _.forEach(this.spies, (spy) => {
            let mission = this.mission_queue.top;
            if (mission && spy.entity.type == `idle`) {
                this.mission_queue.pop();
                spy.entity.assign(mission[1], mission[2]);
            }
        });
        if (this.mission_queue.size > this.memory.queued) {
            this.kernel.spawn_queue.push([
                Game.time,
                [MOVE],
                { memory: { role: `spy` } },
            ]);
            this.memory.queued++;
        }
    }
}

module.exports = Base_spy;
