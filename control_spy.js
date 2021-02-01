`use strict`;

class Control_spy {
    constructor(memory, kernel) {
        this.memory = memory.control_spy = memory.control_spy || {
            spies: [],
            queued: 0,
        };
        this.kernel = kernel;

        this.mission_queue = new Heap(
            `mission_queue`,
            this.memory,
            (mission_1, mission_2) => mission_1[0] < mission_2[0]
        );
    }
    init() {
        this.spies = _.reduce(
            this.memory.spies,
            (rst, name) => {
                if (Game.creeps[name]) {
                    rst.push(Game.creeps[name]);
                } else {
                    this.remove_spy(name);
                }
                return rst;
            },
            []
        );
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
    add_spy(spy) {
        this.memory.spies.push(spy.name);
        this.memory.queued--;
    }
    remove_spy(spy_name) {
        _.remove(this.memory.spies, (name) => name == spy_name);
        this.kernel.funeral.push(() => delete Memory.creeps[spy_name]);
    }
}

module.exports = Control_spy;
