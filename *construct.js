`use strict`;

class Construct extends Asterisk {
    constructor(memory, kernel) {
        super(`construct`, memory, kernel);
        this.memory.builders = this.memory.builders || [];
        this.memory.sites = this.memory.sites || [];

        this.limit = 10;
        this.queue = new Heap(`queue`, this.memory);
    }
    init() {
        this.update(`builders`, Game.getObjectById, `remove_id`);
        this.update(`sites`, Game.getObjectById, `remove_id`);
    }
    run() {
        if (this.sites.length < this.limit && this.queue.top) {
            let [rcl, room_name, x, y, type] = this.queue.pop(),
                pos = new RoomPosition(x, y, room_name),
                ret = pos.createConstructionSite(type);
            if (ret != OK) {
                this.queue.push([rcl, room_name, x, y, type]);
            }
        }
    }
    require(room_name, x, y, type, rcl = 0) {
        this.queue.push([rcl, room_name, x, y, type]);
    }
}

module.exports = Construct;
