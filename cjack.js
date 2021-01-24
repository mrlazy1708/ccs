`use strict`;

class Cjack {
    constructor(memory, kernel) {
        this.memory = memory.cjack = memory.cjack || { jacks: [], queued: 0 };
        this.kernel = kernel;
    }
    init(memory) {
        this.memory = memory.cjack;
    }
    run() {
        _.forEach(this.memory.jacks, (id) => {
            let creep = Game.getObjectById(id);
            if (creep) {
                let exec = this.kernel.oei[id];
                if (!exec || exec.type == `idle`) {
                    if (creep.store.getFreeCapacity() > 0) {
                        let target = creep.pos.findClosestByPath(FIND_SOURCES);
                        if (target) {
                            this.kernel.execute(creep.id, `moveTo`, [
                                target.id,
                            ]);
                            this.kernel.execute(creep.id, `harvest`, [
                                target.id,
                            ]);
                        }
                    } else {
                        let target = creep.pos.findClosestByPath(
                            FIND_MY_SPAWNS
                        );
                        if (
                            target.store.getFreeCapacity(RESOURCE_ENERGY) > 20
                        ) {
                            this.kernel.execute(creep.id, `moveTo`, [
                                target.id,
                            ]);
                            this.kernel.execute(creep.id, `transfer`, [
                                target.id,
                                RESOURCE_ENERGY,
                            ]);
                        } else {
                            target = Game.rooms[`W47S29`].controller;
                            this.kernel.execute(creep.id, `moveTo`, [
                                target.id,
                            ]);
                            this.kernel.execute(creep.id, `upgradeController`, [
                                target.id,
                            ]);
                        }
                    }
                }
            } else {
                this.remove(id);
            }
        });
        if (this.size < 10) {
            this.kernel.cspawn.smh.push([Game.time, [WORK, CARRY, MOVE]]);
            this.memory.queued++;
        }
    }
    add(id) {
        this.memory.jacks.push(id);
        this.memory.queued--; //spawn非正常死亡
    }
    remove(id) {
        _.remove(this.memory, (value) => value == id);
    }
    get size() {
        return this.memory.jacks.length + this.memory.queued;
    }
}

module.exports = Cjack;
