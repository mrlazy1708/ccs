`use strict`;

class Construct extends Asterisk {
    constructor(memory, kernel) {
        super(`construct`, memory, kernel);
        this.memory.builders = this.memory.builders || [];
        this.memory.sites = this.memory.sites || [];

        this.blueprint = this.memory.blueprint;
    }
    init() {
        this.update(`builders`, Game.getObjectById, `remove_id`);
        this.update(`sites`, Game.getObjectById, `remove_id`);
    }
    run() {}
}

module.exports = Construct;
