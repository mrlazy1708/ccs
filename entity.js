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

        this.name = Game.getObjectById(this.id).name || this.id;
        this.face = this.name.split(` `);
        if (this.face.length > 2) {
            this.name = this.name.padEnd(
                this.name.length -
                    this.face[1].length -
                    this.face[2].length +
                    16
            );
            this.face = this.face[0];
        } else {
            this.name = `🌈 ${this.name.padEnd(17)}`;
            this.face = `🌈`;
        }
    }
    init() {
        this.object = Game.getObjectById(this.id);
        if (this.object) {
            this.object.entity = this;
        } else {
            while (this.execution_queue.length > 0) {
                this.execution_queue.shift();
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
    queue(type, data) {
        if (this.type == `idle`) {
            this.kernel.execution_queue.push({
                last_run: Game.time,
                id: this.id,
            });
        }
        this.push(type, data);
    }
    run() {
        this.log = `${this.name}`;
        this.saying = undefined;
        this.execute(this.type, this.data);
        this.object.say(
            `${this.face}${this.kernel.loss.length > 0 ? `🕯` : this.saying}`,
            true
        );
        this.log = this.log.substring(0, this.log.length - 21);
        console.log(
            this.log +
                ` -> ${
                    this.type == `idle`
                        ? Dye(`Finish`, `Yellow`)
                        : Dye(`Continue`, `Blue`)
                }`
        );
        return this.type != `idle`;
    }
    execute(type, data) {
        this.log += ` -> ${Dye(type, `White`)}${JSON.stringify(data)}`;
        let ret = this[type] ? this[type](...data) : this.default(...data);
        if (ret) {
            this.say(Dictionary[type][1]);
            this.shift(); // 继续
        } else {
            this.say(Dictionary[type][0]);
        }
    }
    call(type, ...data) {
        let cpu_usage_start = Game.cpu.getUsed(),
            ret = this.object[type](...data);
        // console.log(Game.cpu.getUsed() - cpu_usage_start);
        this.kernel.efficiency += Game.cpu.getUsed() - cpu_usage_start;
        this.log += ` -> ${Dye(Meaning[-ret], `Red`)}
                    `;
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
    done_idle() {}
    default(id, ...data) {
        try {
            let target = Game.getObjectById(id),
                ret = target
                    ? this.call(this.type, target, ...data)
                    : this.call(this.type, id, ...data);
            return ret != ERR_BUSY && ret != ERR_TIRED;
        } catch (err) {}
    }
    done_default() {}
    say(message) {
        this.saying = this.saying || message;
    }
    moveTo(id, opts) {
        let target = Game.getObjectById(id);
        this.call(`moveTo`, target, opts);
        return this.object.pos.getRangeTo(target.pos) == 0;
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
    spawnCreep(body, name, opts) {
        if (this.memory.done) {
            this.memory.done = false;
            this.kernel.add_creep(Game.creeps[name]);
            return true;
        } else {
            if (this.call(`spawnCreep`, body, name, opts) == OK) {
                this.memory.done = true;
            }
            return false;
        }
    }
}

module.exports = Entity;
