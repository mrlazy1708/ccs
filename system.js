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

        this.blackbox = new Blackbox(this.memory);
    }
    init() {
        Game.system = this;
        this.memory = Memory[this.name];

        _.forEach(this.kernels, (kernel) => kernel.init(this.memory.kernels));

        this.blackbox.init(this.memory);
    }
    run() {
        _.forEach(this.kernels, (kernel) => kernel.run());

        this.blackbox.run();
    }
    shut() {
        _.forEach(this.kernels, (kernel) => kernel.shut());
    }
    reset() {
        delete Memory[this.name].kernels[`k0`];
        this.kernels[`k0`] = new Kernel(`k0`, this.memory.kernels);
        this.kernels[`k0`].init(this.memory.kernels);
        _.forEach(Game.creeps, (creep) => this.kernels[`k0`].add1(creep.id));
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
