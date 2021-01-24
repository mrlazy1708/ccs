`use strict`;

class Execution {
    constructor(id, kernel) {
        this.id = id;
        this.kernel = kernel;
    }
    init(memory) {
        this.memory = memory[this.id];
        this.oem = this.memory.oem;
    }
    run() {
        this.log = `${this.id}> ${Dye(this.type, `White`)}: ${JSON.stringify(
            this.data
        )}`;
        let ret = this.exec();
        console.log(this.log);
        return ret;
    }
    exec() {
        if (Game.getObjectById(this.id)) {
            this.object = Game.getObjectById(this.id);
            if (this.try_catch()) {
                this.log += ` -> ${Dye(`Finish`, `Yellow`)}`;
                try {
                    this.object.say(Dictionary[this.type][1], true);
                } catch (err) {}
                this.memory.oem.shift();
                return this.type != `idle`;
            } else {
                this.log += ` -> ${Dye(`Continue`, `Blue`)}`;
                try {
                    this.object.say(Dictionary[this.type][0], true);
                } catch (err) {}
                return true;
            }
        }
    }
    try_catch() {
        try {
            return this[this.type](...this.data);
        } catch (err) {
            try {
                return this.default(...this.data);
            } catch (err) {
                this.log += ` -> ${Dye(`ERR`, `Red`)}`;
                return this.idle();
            }
        }
    }
    idle() {
        return true;
    }
    default(id, ...data) {
        let target = Game.getObjectById(id),
            ret;
        if (target) {
            ret = this.object[this.type](target, ...data);
        } else {
            ret = this.object[this.type](id, ...data);
        }
        this.log += ` -> ${Dye(Meaning[-ret], `Red`)}`;
        if (ret == OK) {
            return this.check(target);
        } else {
            return ret != ERR_BUSY && ret != ERR_TIRED;
        }
    }
    check(target) {
        switch (this.type) {
            case `moveTo`:
                return this.object.pos.getRangeTo(target) < 2;
            case `harvest`:
                return this.object.store.getFreeCapacity() == 0;
            case `upgradeController`:
                return this.object.store[RESOURCE_ENERGY] == 0;
            default:
                return true;
        }
    }
    spawnCreep(body, name, opts) {
        if (this.memory.start) {
            this.memory.start = false;
            this.kernel.add1(Game.creeps[name].id);
            return true;
        } else {
            let ret = this.object.spawnCreep(body, name, opts);
            this.log += ` -> ${Dye(Meaning[-ret], `Red`)}`;
            if (ret == OK) {
                this.memory.start = true;
            }
            return false;
        }
    }
    get oec() {
        return this.oem[0] || {};
    }
    get type() {
        return this.oec.type || `idle`;
    }
    get data() {
        return this.oec.data;
    }
}

module.exports = Execution;
