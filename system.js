`use strict`;

function import_module() {
    global.Blackbox = require(`blackbox`);
    global.Kernel = require(`kernel`);
    global.Heap = require(`heap`);
    global.Execution = require(`execution`);
    global.Control_jack = require(`control_jack`);
    global.Control_spawn = require(`control_spawn`);
}

function define_constant() {
    global.Meaning = [
        `OK`,
        `ERR_NOT_OWNER`,
        `ERR_NO_PATH`,
        `ERR_NAME_EXISTS`,
        `ERR_BUSY`,
        `ERR_NOT_FOUND`,
        `ERR_NOT_ENOUGH_RESOURCES`,
        `ERR_INVALID_TARGET`,
        `ERR_FULL`,
        `ERR_NOT_IN_RANGE`,
        `ERR_INVALID_ARGS`,
        `ERR_TIRED`,
        `ERR_NO_BODYPART`,
        `ERR_NOT_ENOUGH_EXTENSIONS`,
        `ERR_RCL_NOT_ENOUGH`,
        `ERR_GCL_NOT_ENOUGH`,
    ];
    global.Dictionary = {
        moveTo: [`🚗`, `🎯`],
        harvest: [`⛏`, `🈵`],
        transfer: [`🛢`, `🈳`],
        upgradeController: [`🔋`, `🈳`],
    };

    global.Dye = (string, color) => `<b style="color:${color}">${string}</b>`;
}

class System {
    constructor(name) {
        this.name = name;
        this.memory = Memory[this.name] = Memory[this.name] || {};

        import_module();
        define_constant();

        this.kernels = _.mapValues(
            (this.memory.kernels = this.memory.kernels || {}),
            (_, name) => new Kernel(name, this.memory.kernels)
        );

        this.record_population = new Blackbox(`record_population`, this.memory);
        this.record_cpu_usage = new Blackbox(`record_cpu_usage`, this.memory);
    }
    init() {
        this.cpu_usage = Game.cpu.getUsed();

        Game.system = this;

        this.memory = Memory[this.name];

        _.forEach(this.kernels, (kernel) => kernel.init(this.memory.kernels));

        this.record_cpu_usage.init(this.memory);
        this.record_population.init(this.memory);
    }
    run() {
        _.forEach(this.kernels, (kernel) => kernel.run());

        this.record_cpu_usage.record(
            (this.cpu_usage = Game.cpu.getUsed() - this.cpu_usage)
        );
        this.record_population.record(_.keys(Game.creeps).length);
    }
    shut() {
        _.forEach(this.kernels, (kernel) => kernel.shut());

        this.record_cpu_usage.tick();
        this.record_population.tick();
    }
    get report() {
        let report = `Game report at tick ${Game.time}:\n`;
        report += `  System ${this.name}:\n`;
        report += `    CPU usage : ${this.cpu_usage}\n`;
        report += `    Population: ${_.keys(Game.creeps).length}\n\n`;
        _.forEach(this.kernels, (kernel) => (report += kernel.report));
        return report;
    }
    reset() {
        delete Memory[this.name].kernels[`k0`];
        this.kernels[`k0`] = new Kernel(`k0`, this.memory.kernels);
        this.kernels[`k0`].init(this.memory.kernels);
        _.forEach(Game.creeps, (creep) => this.kernels[`k0`].add1(creep.id));
        this.kernels[`k0`].control_jack.memory.queued = 0;
        this.kernels[`k0`].add2(Game.spawns[`Spawn1`].id);
    }
    spawn(name) {
        this.kernels[`k0`].add(Game.spawns[`Spawn1`].id);
        this.kernels[`k0`].execute(Game.spawns[`Spawn1`].id, `spawnCreep`, [
            [WORK, CARRY, MOVE],
            name,
        ]);
    }
}

module.exports = System;
