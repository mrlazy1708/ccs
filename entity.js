`use strict`;

class Entity {
    constructor(id, kernel) {
        this.id = id;
        this.kernel = kernel;

        try {
            this.name = Game.getObjectById(this.id).name;
        } catch (err) {
            return;
        }
        this.face = this.name.split(` `);
        this.name =
            this.face.length > 2
                ? this.name.padEnd(
                      this.name.length -
                          this.face[1].length -
                          this.face[2].length +
                          16
                  )
                : `🌈 ${this.name.padEnd(17)}`;
        this.face = this.face[0];
    }
    init(memory) {
        this.memory = memory[this.id];
        this.entity_queue = this.memory.entity_queue;
        this.executing = this.entity_queue[0] || {};
        this.type = this.executing[0] || `idle`;
        this.data = this.executing[1] || [];
        this.saying = undefined;

        this.object = Game.getObjectById(this.id);
        if (!this.object) {
            this.kernel.remove_entity(this.id);
        }
    }
    push(type, data) {
        this.type = type;
        this.data = data;
        this.executing = [type, data];
        this.entity_queue.push(this.executing);
    }
    shift() {
        this.entity_queue.shift();
        this.executing = this.entity_queue[0] || {};
        this.type = this.executing[0] || `idle`;
        this.data = this.executing[1] || [];
    }
    run() {
        this.log = `${this.name}`;
        this.execute(this.type, this.data);
        this.object.say(
            `${this.face}${this.kernel.death ? `🕯` : this.saying}`,
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
    transfer(id, resourceType, amount) {
        let target = Game.getObjectById(id),
            ret = this.call(`transfer`, target, resourceType, amount);
        if (ret == ERR_NOT_IN_RANGE) {
            this.execute(`moveTo`, [id]);
        }
        return ret == OK;
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
        if (this.memory.start) {
            this.memory.start = false;
            this.kernel.add_creep(Game.creeps[name]);
            return true;
        } else {
            if (this.call(`spawnCreep`, body, name, opts) == OK) {
                this.memory.start = true;
            }
            return false;
        }
    }
}

module.exports = Entity;
