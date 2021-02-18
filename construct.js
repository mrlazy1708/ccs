`use strict`;

class Construct extends Base {
    constructor(memory, kernel) {
        super(`construct`, memory, kernel);
        this.memory.builders = this.memory.builders || [];
        this.memory.sites = this.memory.sites || [];
    }
    init() {
        this.update(`builders`, Game.getObjectById, `remove_structure`);
        this.update(`sites`, Game.getObjectById, `remove_structure`);
    }
    run() {}
    require(constructionSite) {
        this.add_structure(`sites`, constructionSite);
    }
}

module.exports = Construct;
