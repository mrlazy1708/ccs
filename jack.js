`use strict`;

class Jack extends Base {
    constructor(memory, kernel) {
        super(`jack`, memory, kernel);
        this.memory.jacks = this.memory.jacks || [];
    }
    init() {
        this.update(`jacks`, Game.getCreepByName, `remove_creep`);
    }
    run() {
        _.forEach(this.jacks, (jack) => {
            if (jack.entity.type == `idle`) {
                if (jack.store[RESOURCE_ENERGY] == 0) {
                    let source = jack.pos.findClosestByDistance(
                        _.filter(
                            this.kernel.room.sources,
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
                            this.kernel.spawn.spawns,
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
                            this.kernel.room.core.controller.id,
                        ]);
                    }
                }
            }
        });
        if (
            this.memory.jacks.length + this.kernel.spawn.queued(`jack`) <
            this.kernel.room.sources.length * 5
        ) {
            this.kernel.spawn.require(1, [WORK, CARRY, MOVE], `jack`);
        }
    }
}

module.exports = Jack;