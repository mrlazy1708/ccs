`use strict`;

class Control_jack {
    constructor(memory, kernel) {
        this.memory = memory.control_jack = memory.control_jack || {
            jacks: [],
            queued: 0,
        };
        this.kernel = kernel;
    }
    init() {
        this.jacks = _.reduce(
            this.memory.jacks,
            (rst, name) => {
                if (Game.creeps[name]) {
                    rst.push(Game.creeps[name]);
                } else {
                    this.remove_jack(name);
                }
                return rst;
            },
            []
        );
    }
    run() {
        _.forEach(this.jacks, (jack) => {
            if (jack.entity.type == `idle`) {
                if (jack.store[RESOURCE_ENERGY] == 0) {
                    let source = jack.pos.findClosestByDistance(
                        _.filter(
                            this.kernel.control_room.sources,
                            (source) => source.entity.memory.potential > 0
                        )
                    );
                    if (source) {
                        jack.entity.assign(`harvest`, [source.id, 1]);
                        source.entity.memory.potential--;
                    }
                } else {
                    let spawn = jack.pos.findClosestByDistance(
                        _.filter(
                            this.kernel.control_spawn.spawns,
                            (spawn) =>
                                spawn.store.getFreeCapacity(RESOURCE_ENERGY) >
                                20
                        )
                    );
                    if (spawn) {
                        jack.entity.assign(`transfer`, [
                            spawn.id,
                            RESOURCE_ENERGY,
                        ]);
                    } else {
                        jack.entity.assign(`upgradeController`, [
                            this.kernel.control_room.core.controller.id,
                        ]);
                    }
                }
            }
        });
        if (this.size < this.kernel.control_room.sources.length * 5) {
            this.kernel.spawn_queue.push([
                Game.time,
                [WORK, CARRY, MOVE],
                { memory: { role: `jack` } },
            ]);
            this.memory.queued++;
        }
    }
    add_jack(jack) {
        this.memory.jacks.push(jack.name);
        this.memory.queued--;
    }
    remove_jack(jack_name) {
        _.remove(this.memory.jacks, (name) => name == jack_name);
        this.kernel.funeral.push(() => delete Memory.creeps[jack_name]);
    }
    get size() {
        return this.memory.jacks.length + this.memory.queued;
    }
}

module.exports = Control_jack;
