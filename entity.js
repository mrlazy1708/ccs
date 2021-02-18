`use strict`;

class Entity {
    constructor(id, memory, kernel) {
        this.id = id;
        this.memory = memory[this.id] = memory[this.id] || {};
        this.kernel = kernel;

        this.execution_queue = this.memory.execution_queue =
            this.memory.execution_queue || [];
        this.executing = this.execution_queue[0] || {};
        this.type = this.executing[0] || `idle`;
        this.data = this.executing[1] || [];

        this.lable = (Game.getObjectById(this.id) || {}).name || this.id;
        this.face = this.lable.split(` `);
        if (this.face.length > 2) {
            this.lable = this.lable.padEnd(
                this.lable.length -
                    this.face[1].length -
                    this.face[2].length +
                    LableLength -
                    4
            );
            this.face = this.face[0];
        } else {
            this.lable = `🌈 ${this.lable.padEnd(LableLength - 3)}`;
            this.face = `🌈`;
        }
    }
    get role() {
        return this.object.memory.role;
    }
    set role(role) {
        this.object.memory.role = role;
    }
    init() {
        this.log = `${this.lable}`;
        this.saying = undefined;

        this.object = Game.getObjectById(this.id);
        if (this.object) {
            this.object.entity = this;
        } else {
            while (this.execution_queue.length > 0) {
                this.shift();
            }
            this.kernel.remove_entity(this.id);
        }
    }
    push(type, data) {
        this.type = type;
        this.data = data;
        this.executing = [type, data];
        this.execution_queue.push(this.executing);
    }
    shift() {
        this.terminate(this.type, this.data);
        this.execution_queue.shift();
        this.executing = this.execution_queue[0] || {};
        this.type = this.executing[0] || `idle`;
        this.data = this.executing[1] || [];
    }
    assign(type, data) {
        if (this.type == `idle`) {
            this.kernel.execution_queue.push([Game.time, this.id]);
        }
        this.push(type, data);
    }
    run() {
        if (this.execute(this.type, this.data)) {
            this.shift();
        }
        this.object.say(
            `${this.face}${this.kernel.funeral.length > 0 ? `🕯` : this.saying}`,
            true
        );
        this.kernel.log +=
            this.log.substring(0, this.log.length - LableLength - 1) +
            ` -> ${
                this.type == `idle`
                    ? Dye(`Finish`, `Yellow`)
                    : Dye(`Continue`, `Blue`)
            }\n`;
        return this.type != `idle`;
    }
    execute(type, data) {
        this.log += ` -> ${Dye(type, `White`)}${JSON.stringify(data)}`;
        let ret = this[type] ? this[type](...data) : this.default(...data);
        if (ret) {
            this.say(Dictionary[type][1]);
        } else {
            this.say(Dictionary[type][0]);
        }
        return ret;
    }
    call(type, ...data) {
        let cpu_usage_start = Game.cpu.getUsed(),
            ret = this.object[type](...data);
        // console.log(Game.cpu.getUsed() - cpu_usage_start);
        this.kernel.efficiency += Game.cpu.getUsed() - cpu_usage_start;
        this.log += ` -> ${Dye(MeaningOf[-ret], `Red`)}\n${LeadingSpaces}`;
        return ret;
    }
    terminate(type, data) {
        if (this[`done_${type}`]) {
            this[`done_${type}`](...data);
        } else {
            this.done_default(...data);
        }
    }
    idle() {
        return true;
    }
    default(id, ...data) {
        try {
            let target = Game.getObjectById(id),
                ret = target
                    ? this.call(this.type, target, ...data)
                    : this.call(this.type, id, ...data);
            return ret != ERR_BUSY && ret != ERR_TIRED;
        } catch (err) {}
    }
    done_default() {
        _.forEach(_.keys(this.memory), (key) => delete this.memory[key]);
        this.memory.execution_queue = this.execution_queue;
    }
    say(message) {
        this.saying = this.saying || message;
    }
    moveTo(id, opts = {}) {
        let target = Game.getObjectById(id);
        // opts.visualizePathStyle = opts.visualizePathStyle || {};
        this.call(`moveTo`, target, opts);
        return this.object.pos.getRangeTo(target.pos) == 0;
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
            this.execute(`moveTo`, [id]);
        }
        return this.object.store.getFreeCapacity(RESOURCE_ENERGY) == 0;
    }
    done_harvest(id, reserved) {
        let entity = this.kernel.entities[id];
        if (entity) {
            entity.memory.potential += reserved;
        }
    }
    transfer(id, resourceType, amount) {
        let target = Game.getObjectById(id),
            ret = this.call(`transfer`, target, resourceType, amount);
        if (ret == ERR_NOT_IN_RANGE) {
            this.execute(`moveTo`, [id]);
        }
        return ret == OK || ret == ERR_FULL;
    }
    upgradeController(id) {
        let target = Game.getObjectById(id),
            ret = this.call(`upgradeController`, target);
        if (ret == ERR_NOT_IN_RANGE) {
            this.execute(`moveTo`, [id]);
        }
        return ret == ERR_NOT_ENOUGH_RESOURCES;
    }
    spawnCreep(body, role, name) {
        if (this.memory.done) {
            this.log += `\n${LeadingSpaces}`;
            this.kernel.add_creep(Game.creeps[name]);
            return true;
        } else {
            let ret = this.call(`spawnCreep`, body, name, {
                memory: { role: role },
            });
            if (ret == OK) {
                this.memory.done = true;
            }
            return ret == ERR_INVALID_ARGS;
        }
    }
    done_spawnCreep(_body, role, _name) {
        this.kernel.hatch.memory.queued[role]--;
        this.memory.done = false;
    }
    spy(room_name) {
        console.log(this.memory.room);
        if (this.memory.room != room_name) {
            this.log += `\n${LeadingSpaces}`;
            this.execute(`moveToRoom`, [room_name]);
            return false;
        } else {
            this.kernel.add_room(Game.rooms[room_name]);
            return true;
        }
    }
}

module.exports = Entity;
