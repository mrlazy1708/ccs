`use strict`;

class Kernel {
    constructor(name, memory, system) {
        this.name = name;
        this.memory = memory[this.name] = memory[this.name] || {};
        this.system = system;

        this.queue = new Heap(`queue`, this.memory);

        _.forEach(
            HashTypes,
            (type) =>
                (this[type] = _.mapValues(
                    (this.memory[type] = this.memory[type] || {}),
                    (_, name, memory) => new global[type](name, memory, this)
                ))
        );

        this.sector = new Sector(this.memory, this);

        this.jack = new Jack(this.memory, this);

        this.hatch = new Hatch(this.memory, this);

        this.construct = new Construct(this.memory, this);

        this.spy = new Spy(this.memory, this);

        this.record_cpu_usage = new Blackbox(`record_cpu_usage`, this.memory);
        this.record_execution = new Blackbox(`record_execution`, this.memory);
        this.record_efficiency = new Blackbox(`record_efficiency`, this.memory);
    }
    init() {
        this.log = `\nKernel ${this.name} :\n\n`;

        _.forEach(HashTypes, (type) =>
            _.forEach(this[type], (hash) => hash.init())
        );

        this.sector.init();
        this.jack.init();
        this.hatch.init();
        this.construct.init();
        this.spy.init();
    }
    run() {
        this.record_cpu_usage.tick();
        this.record_execution.tick();
        this.record_efficiency.tick();

        this.cpu_usage = Game.cpu.getUsed();
        this.execution_count = 0;
        this.efficiency = 0;

        this.jack.run();
        this.hatch.run();
        this.construct.run();
        this.spy.run();

        for (
            let top = this.queue.top;
            top && top[0] < Game.time && Game.cpu.getUsed() < 5;
            top = this.queue.top
        ) {
            this.queue.pop();
            let hash = this.find_hash(top[1]);
            if (hash) {
                this.execution_count++;
                if (hash.run()) {
                    this.queue.push([Game.time, top[1]]);
                }
            }
        }

        this.record_cpu_usage.record(
            (this.cpu_usage = Game.cpu.getUsed() - this.cpu_usage)
        );
        this.record_execution.record(this.execution_count);
        this.record_efficiency.record(
            (this.efficiency = (100 * this.efficiency) / this.cpu_usage)
        );
    }
    shut() {
        this.system.log += this.log;
    }
    get report() {
        let report = `    Kernel ${this.name}:\n`;
        report += `      CPU usage : ${this.cpu_usage}\n`;
        report += `      Execution : ${this.execution_count}\n`;
        report += `      Efficiency: ${this.efficiency}\n\n`;
        return report;
    }
    find_hash(key) {
        return _.reduce(
            HashTypes,
            (hash, type) => (hash ? hash : this[type][key]),
            undefined
        );
    }
    get_hash(type, object) {
        let key = object.name || object.id;
        if (this[type][key]) return this[type][key];

        let hash = new global[type](key, this.memory[type], this);
        this[type][key] = hash;
        hash.init();
        return hash;
    }
    remove_hash(key) {
        _.forEach(HashTypes, (type) => {
            delete this.memory[type][key];
            delete this[type][key];
        });
    }
    add_creep(creep) {
        let hash = this.get_hash(`Creeps`, creep);

        if (creep.memory.role == `jack`) {
            this.jack.add_name(`jacks`, creep);
        }
        if (creep.memory.role == `builder`) {
            this.construct.add_name(`builders`, creep);
        }
        if (creep.memory.role == `spy`) {
            this.spy.add_name(`spies`, creep);
        }

        return hash;
    }
    add_structure(structure) {
        let hash = this.get_hash(`Structures`, structure);

        if (structure instanceof ConstructionSite) {
            this.construct.add_id(`sites`, structure);
        } else {
            if (structure.structureType == STRUCTURE_SPAWN) {
                this.hatch.add_name(`spawns`, structure);
            }
        }

        return hash;
    }
    add_room(room) {
        let hash = this.get_hash(`Rooms`, room);

        this.sector.add_room(room);

        let creeps = room.find(FIND_MY_CREEPS);
        _.forEach(creeps, (creep) => this.add_creep(creep));

        let structures = room.find(FIND_MY_STRUCTURES);
        _.forEach(structures, (structure) => this.add_structure(structure));

        let sites = room.find(FIND_MY_CONSTRUCTION_SITES);
        _.forEach(sites, (site) => this.add_structure(site));

        return hash;
    }
    add_remote(room_name) {
        this.spy.queue.push([Game.time, `spy`, [room_name]]);
    }
    ok() {
        this.sector.plan_room(this.sector.core);
        this.system.graphic.shut();
    }
}

module.exports = Kernel;
