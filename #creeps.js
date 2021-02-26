`use strict`;

class Creeps extends Hash {
    constructor(name, memory, kernel) {
        super(name, memory, kernel);

        try {
            this.lable = this.key;
            this.face = this.lable.split(` `);
            this.lable = this.lable.padEnd(
                this.lable.length -
                    this.face[1].length -
                    this.face[2].length +
                    LableLength -
                    4
            );
            this.face = this.face[0];
        } catch (err) {
            this.face = IconOf.creep;
            this.lable = `${this.face} ${this.key.padEnd(LableLength - 3)}`;
        }
    }
    init() {
        this.object = Game.creeps[this.key];
        if (this.object) {
            this.object.hash = this;
        } else {
            this.kill();
            this.kernel.remove_hash(this.key);
            delete Memory.creeps[this.key];
        }
    }
    run() {
        let ret = this.run_default();
        this.object.say(this.saying || `🍵`, true);
        return ret;
    }

    move(direction) {
        this.call(`move`, direction);
        return true;
    }

    moveTo(target_id, _opts) {
        let hash = this.object.room.hash;
        if (hash.check(`table`)) {
            let target_index = hash.table[target_id];
            if (target_index) {
                this.result(`OK`);
                return this.run_one(`moveToNode`, [target_index]);
            } else {
                this.result(`ERR_UNKNOWN_TARGET`);
            }
        }
        // let target = Game.getObjectById(id);
        // this.call(`moveTo`, target, opts);
        // return this.object.pos.getRangeTo(target.pos) == 0;
    }

    moveToPos(pos, range) {
        this.call(`moveTo`, pos);
        return this.object.pos.getRangeTo(pos) <= range;
    }

    moveToNode(target_index) {
        let hash = this.object.room.hash;
        if (hash.check(`road_map`) && hash.check(`road_tree`)) {
            let node = hash.road_map.get(this.object.pos.x, this.object.pos.y);
            if (!node) {
                this.result(`OFF_ROAD`);
                if (!this.memory.shore) {
                    if (hash.check(`road`)) {
                        let road_pos = this.object.pos.findClosestByRange(
                            hash.road
                        );
                        this.memory.shore = [road_pos.x, road_pos.y];
                    } else {
                        return false;
                    }
                }
                if (hash.check(`road_map`)) {
                    this.run_one(`moveToPos`, [
                        hash.road_map.get(...this.memory.shore).pos(hash.key),
                        0,
                    ]);
                }
                return false;
            } else {
                delete this.memory.shore;
            }
            if (node && node.index == target_index) {
                this.result(`ARRIVEED`);
                return true;
            }
            this.result(`AT_${node.index}`);
            let next = node.children[0];
            if (node.index == 0 || node.children.length != 1) {
                let route = node.tree.nodes[target_index].to_root();
                for (; route.length > 0 && route.pop().index != node.index; );
                if (route.length > 0) {
                    this.memory.down = true;
                    next = route[route.length - 1];
                } else {
                    this.memory.down = false;
                }
            }
            if (this.memory.down) {
                this.run_one(`move`, [OppositeOf[next.d]]);
            } else {
                this.run_one(`move`, [node.d]);
            }
        } else {
            this.result(`OFF_ROAD`);
        }
    }

    moveToRoom(room_name) {
        let room = this.object.room;
        if (this.memory.room != room.name) {
            this.memory.room = room.name;
            if (this.memory.flag) {
                Game.flags[this.memory.flag].remove();
            }
            if (this.memory.exit) {
                let ret = this.call(`move`, this.memory.exit);
                if (ret != OK) {
                    return true;
                }
            } else {
                try {
                    this.memory.exit = room.findExitTo(room_name);
                    let position = this.object.pos.findClosestByPath(
                            this.memory.exit
                        ),
                        flag_name = position.createFlag(
                            `${this.object.name} to ${room_name}`
                        );
                    this.memory.flag = Game.flags[flag_name].name;
                } catch (err) {
                    return true;
                }
            }
            return room.name == room_name;
        } else {
            let flag = Game.flags[this.memory.flag];
            this.call(`moveTo`, flag);
        }
    }

    harvest(id) {
        let target = Game.getObjectById(id);
        if (this.call(`harvest`, target) == ERR_NOT_IN_RANGE) {
            this.run_one(`moveTo`, [id]);
        }
        return this.object.store.getFreeCapacity(RESOURCE_ENERGY) == 0;
    }
    done_harvest(id, reserved) {
        let hash = this.kernel.Structures[id];
        if (hash) {
            hash.memory.potential += reserved;
        }
    }

    transfer(id, resourceType, amount) {
        let target = Game.getObjectById(id),
            ret = this.call(`transfer`, target, resourceType, amount);
        if (ret == ERR_NOT_IN_RANGE) {
            this.run_one(`moveTo`, [id]);
        }
        return ret == OK || ret == ERR_FULL;
    }

    build(id) {
        let target = Game.getObjectById(id),
            ret = this.call(`build`, target);
        if (ret == ERR_NOT_IN_RANGE) {
            this.run_one(`moveTo`, [id]);
        }
        return this.object.store[RESOURCE_ENERGY] == 0;
    }

    upgradeController(id) {
        let target = Game.getObjectById(id),
            ret = this.call(`upgradeController`, target);
        if (ret == ERR_NOT_IN_RANGE) {
            this.run_one(`moveTo`, [id]);
        }
        return ret == ERR_NOT_ENOUGH_RESOURCES;
    }

    spy(room_name) {
        if (this.memory.room != room_name) {
            this.result(`NOT_IN_ROOM`);
            this.run_one(`moveToRoom`, [room_name]);
            return false;
        } else {
            this.result(`OK`);
            this.kernel.add_room(Game.rooms[room_name]);
            return true;
        }
    }
}

module.exports = Creeps;
