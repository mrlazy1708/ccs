const Cspawn = require("./cspawn");

`use strict`;

class Kernel {
    constructor(name, memory) {
        this.name = name;
        this.memory = memory[this.name] = memory[this.name] || {};

        this.oms = this.memory.oms = this.memory.oms || {};
        this.oei = _.mapValues(this.oms, (_, key) => new Execution(key, this));

        this.oemh = new Heap(
            `oemh`,
            this.memory,
            (oem_1, oem_2) => oem_1.let < oem_2.let
        );

        this.cjack = new Cjack(this.memory, this);
        this.cspawn = new Cspawn(this.memory, this);
    }
    init(memory) {
        this.memory = memory[this.name];

        this.oms = this.memory.oms;
        _.forEach(this.oei, (oei) => oei.init(this.oms));

        this.oemh.init(this.memory);

        this.cjack.init(this.memory);
        this.cspawn.init(this.memory);
    }
    run() {
        this.cjack.run();
        this.cspawn.run();

        for (
            let oem = this.oemh.top;
            oem && oem.let < Game.time && Game.cpu.getUsed() < 5;
            oem = this.oemh.top
        ) {
            this.oemh.pop();
            if (this.memory.oms[oem.id]) {
                if (this.oei[oem.id]) {
                    if (this.oei[oem.id].run()) {
                        this.oemh.push({ let: Game.time, id: oem.id });
                    } else {
                        console.log(`finish~`);
                    }
                }
            } else {
                console.log(`missing!`);
            }
        }
    }
    shut() {}
    add1(id) {
        this.oms[id] = { oem: [] };
        this.oei[id] = new Execution(id, this);
        this.oei[id].init(this.oms);

        this.cjack.add(id);
    }
    add2(id) {
        this.oms[id] = { oem: [] };
        this.oei[id] = new Execution(id, this);
        this.oei[id].init(this.oms);

        this.cspawn.add(id);
    }
    execute(id, type, data) {
        let oei = this.oei[id];
        if (oei.type == `idle`) {
            this.oemh.push({ let: Game.time, id: id });
        }
        this.oms[id].oem.push({ type: type, data: data });
    }
    remove(id) {
        this.cjack.remove(id);
        delete this.oms[id];
        delete this.oei[id];
    }
}

module.exports = Kernel;
