`use strict`;

class Jack extends Asterisk {
    constructor(memory, kernel) {
        super(`jack`, memory, kernel);
        this.memory.jacks = this.memory.jacks || [];
    }
    init() {
        this.update(`jacks`, Game.getObjectByName, `remove_name`);
    }
    run() {
        _.forEach(this.jacks, (jack) => {
            if (jack.hash.state == `idle`) {
                if (jack.store[RESOURCE_ENERGY] == 0) {
                    let source = jack.pos.findClosestByDistance(
                        _.filter(
                            this.kernel.sector.sources,
                            (source) => source.hash.memory.potential > 0
                        )
                    );
                    if (source) {
                        jack.hash.assign(`harvest`, [source.id, 1]);
                        source.hash.memory.potential--;
                    }
                } else {
                    let spawn = jack.pos.findClosestByDistance(
                        _.filter(
                            this.kernel.hatch.spawns,
                            (spawn) =>
                                spawn.store.getFreeCapacity(RESOURCE_ENERGY) >
                                20
                        )
                    );
                    if (spawn) {
                        jack.hash.assign(`transfer`, [
                            spawn.id,
                            RESOURCE_ENERGY,
                        ]);
                    } else {
                        let site = jack.pos.findClosestByDistance(
                            this.kernel.sector.sites
                        );
                        if (site) {
                            jack.hash.assign(`build`, [site.id]);
                        } else {
                            jack.hash.assign(`upgradeController`, [
                                this.kernel.sector.core.controller.id,
                            ]);
                        }
                    }
                }
            }
        });
        if (
            this.memory.jacks.length + this.kernel.hatch.queued(`jack`) <
            this.kernel.sector.sources.length * 5
        ) {
            this.kernel.hatch.require(1, [WORK, CARRY, MOVE], `jack`);
        }
    }
}

module.exports = Jack;
