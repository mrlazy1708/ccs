`use strict`;

function import_module() {
    global.Blackbox = require(`blackbox`);
    global.Kernel = require(`kernel`);
    global.Heap = require(`heap`);
    global.Entity = require(`entity`);
    global.Control_room = require(`control_room`);
    global.Control_jack = require(`control_jack`);
    global.Control_spawn = require(`control_spawn`);
}

function define_constant() {
    // prettier-ignore
    global.Meaning = [`OK`,`ERR_NOT_OWNER`,`ERR_NO_PATH`,`ERR_NAME_EXISTS`,`ERR_BUSY`,`ERR_NOT_FOUND`,`ERR_NOT_ENOUGH_RESOURCES`,`ERR_INVALID_TARGET`,`ERR_FULL`,`ERR_NOT_IN_RANGE`,`ERR_INVALID_ARGS`,`ERR_TIRED`,`ERR_NO_BODYPART`,`ERR_NOT_ENOUGH_EXTENSIONS`,`ERR_RCL_NOT_ENOUGH`,`ERR_GCL_NOT_ENOUGH`,];
    global.Dictionary = {
        idle: [`🥱`, `🥱`],
        moveTo: [`🚗`, `🎯`],
        harvest: [`⛏`, `🈵`],
        transfer: [`🛢`, `🈳`],
        upgradeController: [`🔋`, `🈳`],

        spawnCreep: [],
    };
    // prettier-ignore
    global.Faces = {
        boy: ['👨','👨🏻','👨🏼','👨🏽','👨🏾','👨🏿','👨‍🦱','👨🏻‍🦱','👨🏼‍🦱','👨🏽‍🦱','👨🏾‍🦱','👨🏿‍🦱','👨‍🦰','👨🏻‍🦰','👨🏼‍🦰','👨🏽‍🦰','👨🏾‍🦰','👨🏿‍🦰','👱‍♂️','👱🏻‍♂️','👱🏼‍♂️','👱🏽‍♂️','👱🏾‍♂️','👱🏿‍♂️','👨‍🦳','👨🏻‍🦳','👨🏼‍🦳','👨🏽‍🦳','👨🏾‍🦳','👨🏿‍🦳','👨‍🦲','👨🏻‍🦲','👨🏼‍🦲','👨🏽‍🦲','👨🏾‍🦲','👨🏿‍🦲',],
        girl: ['👩','👩🏻','👩🏼','👩🏽','👩🏾','👩🏿','👩‍🦱','👩🏻‍🦱','👩🏼‍🦱','👩🏽‍🦱','👩🏾‍🦱','👩🏿‍🦱','👩‍🦰','👩🏻‍🦰','👩🏼‍🦰','👩🏽‍🦰','👩🏾‍🦰','👩🏿‍🦰','👱‍♀️','👱🏻‍♀️','👱🏼‍♀️','👱🏽‍♀️','👱🏾‍♀️','👱🏿‍♀️','👩‍🦳','👩🏻‍🦳','👩🏼‍🦳','👩🏽‍🦳','👩🏾‍🦳','👩🏿‍🦳','👩‍🦲','👩🏻‍🦲','👩🏼‍🦲','👩🏽‍🦲','👩🏾‍🦲','👩🏿‍🦲',],
    };
    // prettier-ignore
    global.Names = {
        last: [`Smith`,`Johnson`,`Williams`,`Brown`,`Jones`,`Garcia`,`Miller`,`Davis`,`Rodriguez`,`Martinez`,`Hernandez`,`Lopez`,`Gonzalez`,`Wilson`,`Anderson`,`Thomas`,`Taylor`,`Moore`,`Jackson`,`Martin`,`Lee`,`Perez`,`Thompson`,`White`,`Harris`,`Sanchez`,`Clark`,`Ramirez`,`Lewis`,`Robinson`,`Walker`,`Young`,`Allen`,`King`,`Wright`,`Scott`,`Torres`,`Nguyen`,`Hill`,`Flores`,`Green`,`Adams`,`Nelson`,`Baker`,`Hall`,`Rivera`,`Campbell`,`Mitchell`,`Carter`,`Roberts`,],
        first: {
            boy: [  `Liam`,`Noah`,`Oliver`,`William`,`Elijah`,`James`,`Benjamin`,`Lucas`,`Mason`,`Ethan`,`Alexander`,`Henry`,`Jacob`,`Michael`,`Daniel`,`Logan`,`Jackson`,`Sebastian`,`Jack`,`Aiden`,`Owen`,`Samuel`,`Matthew`,`Joseph`,`Levi`,`Mateo`,`David`,`John`,`Wyatt`,`Carter`,`Julian`,`Luke`,`Grayson`,`Isaac`,`Jayden`,`Theodore`,`Gabriel`,`Anthony`,`Dylan`,`Leo`,`Lincoln`,`Jaxon`,`Asher`,`Christopher`,`Josiah`,`Andrew`,`Thomas`,`Joshua`,`Ezra`,`Hudson`,
                    `Charles`,`Caleb`,`Isaiah`,`Ryan`,`Nathan`,`Adrian`,`Christian`,`Maverick`,`Colton`,`Elias`,`Aaron`,`Eli`,`Landon`,`Jonathan`,`Nolan`,`Hunter`,`Cameron`,`Connor`,`Santiago`,`Jeremiah`,`Ezekiel`,`Angel`,`Roman`,`Easton`,`Miles`,`Robert`,`Jameson`,`Nicholas`,`Greyson`,`Cooper`,`Ian`,`Carson`,`Axel`,`Jaxson`,`Dominic`,`Leonardo`,`Luca`,`Austin`,`Jordan`,`Adam`,`Xavier`,`Jose`,`Jace`,`Everett`,`Declan`,`Evan`,`Kayden`,`Parker`,`Wesley`,`Kai`,],
            girl: [ `Olivia`,`Emma`,`Ava`,`Sophia`,`Isabella`,`Charlotte`,`Amelia`,`Mia`,`Harper`,`Evelyn`,`Abigail`,`Emily`,`Ella`,`Elizabeth`,`Camila`,`Luna`,`Sofia`,`Avery`,`Mila`,`Aria`,`Scarlett`,`Penelope`,`Layla`,`Chloe`,`Victoria`,`Madison`,`Eleanor`,`Grace`,`Nora`,`Riley`,`Zoey`,`Hannah`,`Hazel`,`Lily`,`Ellie`,`Violet`,`Lillian`,`Zoe`,`Stella`,`Aurora`,`Natalie`,`Emilia`,`Everly`,`Leah`,`Aubrey`,`Willow`,`Addison`,`Lucy`,`Audrey`,`Bella`,
                    `Nova`,`Brooklyn`,`Paisley`,`Savannah`,`Claire`,`Skylar`,`Isla`,`Genesis`,`Naomi`,`Elena`,`Caroline`,`Eliana`,`Anna`,`Maya`,`Valentina`,`Ruby`,`Kennedy`,`Ivy`,`Ariana`,`Aaliyah`,`Cora`,`Madelyn`,`Alice`,`Kinsley`,`Hailey`,`Gabriella`,`Allison`,`Gianna`,`Serenity`,`Samantha`,`Sarah`,`Autumn`,`Quinn`,`Eva`,`Piper`,`Sophie`,`Sadie`,`Delilah`,`Josephine`,`Nevaeh`,`Adeline`,`Arya`,`Emery`,`Lydia`,`Clara`,`Vivian`,`Madeline`,`Peyton`,`Julia`,`Rylee`,],
        },
    };

    global.Dye = (string, color) => `<b style="color:${color}">${string}</b>`;
}

function set_prototype() {
    Spawn.prototype.say = () => {};
}

class System {
    constructor(name) {
        this.name = name;
        this.memory = Memory[this.name] = Memory[this.name] || {};

        import_module();
        define_constant();
        set_prototype();

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
    new_kernel(core) {
        delete this.memory.kernels[`k_${core.name}`];
        let kernel = (this.kernels[`k_${core.name}`] = new Kernel(
            `k_${core.name}`,
            this.memory.kernels
        ));
        kernel.init(this.memory.kernels);
        kernel.add_room(core);
        kernel.set_core(core);
        kernel.control_jack.memory.queued = 0;
    }
    spawn(name) {
        this.kernels[`k0`].add1(Game.spawns[`Spawn1`].id);
        this.kernels[`k0`].execute(Game.spawns[`Spawn1`].id, `spawnCreep`, [
            [WORK, CARRY, MOVE],
            name,
        ]);
    }
}

module.exports = System;
