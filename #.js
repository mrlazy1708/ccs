`use strict`;

class Hash {
    constructor(key, memory, kernel) {
        this.key = key;
        this.memory = memory[this.key] = memory[this.key] || {};
        this.kernel = kernel;
        this.system = this.kernel.system;

        this.queue = this.memory.queue = this.memory.queue || [];
        this.update();
    }
    update() {
        this.current = this.queue[0] || {};
        this.state = this.current[0] || `idle`;
        this.data = this.current[1] || [];
    }
    shift() {
        this.kill_one(this.state, this.data);
        this.queue.shift();
        this.update();
    }
    assign(type, data = []) {
        if (this.state == `idle`) {
            this.kernel.queue.push([Game.time, this.key]);
        }
        this.state = type;
        this.data = data;
        this.current = [type, data];
        this.queue.unshift(this.current);
    }
    run() {
        return this.run_default();
    }
    run_default() {
        this.log = `${this.lable}`;
        this.saying = undefined;
        if (this.run_one(this.state, this.data, true)) {
            this.log += ` [${Dye(`Finish`, `Yellow`)}]\n`;
            this.shift();
        } else {
            this.log += ` [${Dye(`Continue`, `Blue`)}]\n`;
        }
        this.kernel.log += this.log;
        this.log = `${this.lable}`;
        return this.state != `idle`;
    }
    run_one(type, data, indent) {
        this.log += indent ? `` : `\n${LeadingSpaces}`;
        this.log += ` -> ${Dye(type, `White`)}${JSON.stringify(data)}`;
        let ret;
        if (this[type]) {
            ret = this[type](...data);
        } else {
            ret = this.default(...data);
        }
        this.saying = this.saying || (SayingOf[type] || [])[ret ? 1 : 0];
        return ret;
    }
    kill() {
        this.kill_one(this.state, this.data, true);
        for (; this.queue.length > 0; this.queue.shift()) {
            this.kill_one(this.state, this.data);
        }
    }
    kill_one(type, data) {
        if (this[`done_${type}`]) {
            this[`done_${type}`](...data);
        } else {
            this.done_default(...data);
        }
    }
    call(type, ...data) {
        let cpu_usage_start = Game.cpu.getUsed(),
            ret = this.object[type](...data);
        this.kernel.efficiency += Game.cpu.getUsed() - cpu_usage_start;
        this.result(MeaningOf[ret]);
        return ret;
    }
    result(message) {
        this.log += `: ${Dye(message, message == `OK` ? `Green` : `Red`)}`;
    }
    idle() {
        return false;
    }
    default(id, ...data) {
        try {
            let target = Game.getObjectById(id),
                ret = target
                    ? this.call(this.state, target, ...data)
                    : this.call(this.state, id, ...data);
            return ret != ERR_BUSY && ret != ERR_TIRED;
        } catch (err) {}
    }
    done_default() {
        _.forEach(_.keys(this.memory), (key) => delete this.memory[key]);
        this.memory.queue = this.queue;
    }
}

module.exports = Hash;
