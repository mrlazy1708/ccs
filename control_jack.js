`use strict`;

class Control_jack {
    constructor(memory, kernel) {
        this.memory = memory.control_jack = memory.control_jack || {
            jacks: [],
            queued: 0,
        };
        this.kernel = kernel;
    }
    init(memory) {
        this.memory = memory.control_jack;
    }
    run() {
        _.forEach(this.memory.jacks, (name) => {
            let creep = Game.creeps[name];
            if (creep) {
                if (creep.entity.type == `idle`) {
                    if (creep.store[RESOURCE_ENERGY] == 0) {
                        let source = creep.pos.findClosestByPath(
                            this.kernel.control_room.sources
                        );
                        if (source) {
                            creep.entity.queue(`harvest`, [source.id]);
                        }
                    } else {
                        let spawn = creep.pos.findClosestByPath(
                            _.filter(
                                this.kernel.control_spawn.spawns,
                                (spawn) =>
                                    spawn.store.getFreeCapacity(
                                        RESOURCE_ENERGY
                                    ) > 20
                            )
                        );
                        if (spawn) {
                            creep.entity.queue(`transfer`, [
                                spawn.id,
                                RESOURCE_ENERGY,
                            ]);
                        } else {
                            creep.entity.queue(`upgradeController`, [
                                this.kernel.control_room.core.controller.id,
                            ]);
                        }
                    }
                }
            } else {
                this.remove_jack(name);
            }
        });
        if (this.size < 10) {
            this.kernel.control_spawn.spawn_queue.push([
                Game.time,
                [WORK, CARRY, MOVE],
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
        this.kernel.loss.push(() => delete Memory.creeps[jack_name]);
    }
    get size() {
        return this.memory.jacks.length + this.memory.queued;
    }
}

module.exports = Control_jack;
