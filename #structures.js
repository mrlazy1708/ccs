`use strict`;

class Structure extends Hash {
    constructor(id, memory, kernel) {
        super(id, memory, kernel);

        this.face = Icons[Game.getObject(this.key).structureType];
        this.lable = `${this.face} ${this.key.padEnd(LableLength - 3)}`;
    }
    init() {
        this.object = Game.getObject(this.key);
        if (this.object) {
            this.object.hash = this;
        } else {
            this.kill();
            this.kernel.remove_hash(this.key);
        }
    }

    spawnCreep(body, role, name) {
        if (this.memory.done) {
            this.result(`SPAWNING`);
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
}

module.exports = Structure;
