`use strict`;

function import_module() {
    global.Blackbox = require(`blackbox`);
    global.Heap = require(`heap`);
    global.Graphic = require(`graphic`);
    global.Kernel = require(`kernel`);
    global.Base = require(`base`);
    global.Base_room = require(`base_room`);
    global.Base_jack = require(`base_jack`);
    global.Base_spawn = require(`base_spawn`);
    global.Base_spy = require(`base_spy`);
    global.Entity = require(`entity`);
}

function define_constant() {
    global.LableLength = 25;
    global.LeadingSpaces = ` `.repeat(LableLength);
    // prettier-ignore
    global.MeaningOf = [`OK`,`ERR_NOT_OWNER`,`ERR_NO_PATH`,`ERR_NAME_EXISTS`,`ERR_BUSY`,`ERR_NOT_FOUND`,`ERR_NOT_ENOUGH_RESOURCES`,`ERR_INVALID_TARGET`,`ERR_FULL`,`ERR_NOT_IN_RANGE`,`ERR_INVALID_ARGS`,`ERR_TIRED`,`ERR_NO_BODYPART`,`ERR_NOT_ENOUGH_EXTENSIONS`,`ERR_RCL_NOT_ENOUGH`,`ERR_GCL_NOT_ENOUGH`,];
    global.Dictionary = {
        idle: [`🥱`, `🥱`],
        moveTo: [`🚗`, `🎯`],
        moveToRoom: [`🗺`, `🎯`],
        harvest: [`⛏`, `🈵`],
        transfer: [`🛢`, `🈳`],
        upgradeController: [`🔋`, `🈳`],
        spawnCreep: [],
        spy: [`👀`, `🎯`],
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
    // prettier-ignore
    global.Directions = [[0, -1],[1, -1],[1, 0],[1, 1],[0, 1],[-1, 1],[-1, 0],[-1, -1],];
    // prettier-ignore
    global.Perpendiculars = [[0, -1],[1, 0],[0, 1],[-1, 0],];
    // prettier-ignore
    global.Diagonals = [[-1, 1],[-1, -1],[1, -1],[1, 1],];
    global.MoveCost = {
        wall: Infinity,
        swamp: 3,
        plain: 1,
    };
    global.Opposite = {
        TOP: BOTTOM,
        TOP_RIGHT: BOTTOM_LEFT,
        RIGHT: LEFT,
        BOTTOM_RIGHT: TOP_LEFT,
        BOTTOM: TOP,
        BOTTOM_LEFT: TOP_RIGHT,
        LEFT: RIGHT,
        TOP_LEFT: BOTTOM_RIGHT,
    };

    global.Dye = (string, color) => `<b style="color:${color}">${string}</b>`;
    global.Parse = (room_name) =>
        /^([WE])([0-9]+)([NS])([0-9]+)$/.exec(room_name);
    global.Coordinate = (pos) => {
        let parse = Parse(pos.roomName);
        return [
            (parse[1] == `W` ? -parse[2] - 1 : +parse[2]) * 50 + pos.x,
            (parse[3] == `N` ? -parse[4] - 1 : +parse[4]) * 50 + pos.y,
        ];
    };
    global.Square = (init = 0) =>
        Array.from({ length: 50 }, (_) =>
            Array.from({ length: 50 }, (_) => init)
        );
    global.Check = (u) => u >= 0 && u < 50;
    global.Frame = (range) =>
        range == 0
            ? [[0, 0]]
            : _.flatten(
                  _.zipWith(Diagonals, Perpendiculars, ([x0, y0], [dx, dy]) => {
                      (x0 *= range), (y0 *= range);
                      return Array.from({ length: range * 2 }, (_) => [
                          (x0 += dx),
                          (y0 += dy),
                      ]);
                  })
              );
}

function set_prototype() {
    Array.prototype.empty = function () {
        return this.length == 0;
    };
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
    Spawn.prototype.say = () => {};
    Room.prototype.terrain = function (map = _.identity) {
        return _.chunk(
            _.map(this.getTerrain().getRawBuffer(), (value) =>
                map(
                    value & TERRAIN_MASK_WALL
                        ? `wall`
                        : value & TERRAIN_MASK_SWAMP
                        ? `swamp`
                        : `plain`
                )
            ),
            50
        );
    };
    Room.prototype.draw = function (group, type, ...args) {
        this.memory[group] = this.memory[group] || [];
        this.memory[group].push([type, ...args]);
        this.memory[visual];
    };
    RoomPosition.prototype.getReachability = function () {
        let terrain = new Room.Terrain(this.roomName),
            x = this.x,
            y = this.y;
        return _.sum(
            _.map(Directions, (delta) =>
                terrain.get(x + delta[0], y + delta[1]) == TERRAIN_MASK_WALL
                    ? 0
                    : 1
            )
        );
    };
    RoomPosition.prototype.getDistanceTo = function (target) {
        if (!(target instanceof RoomPosition)) {
            if (target.pos instanceof RoomPosition) {
                target = target.pos;
            } else {
                return Infinity;
            }
        }
        let cor_1 = Coordinate(this),
            cor_2 = Coordinate(target);
        return Math.max(
            Math.abs(cor_1[0] - cor_2[0]),
            Math.abs(cor_1[1] - cor_2[1])
        );
    };
    RoomPosition.prototype.findClosestByDistance = function (targets) {
        let _this = this;
        return _.reduce(
            targets,
            (rst, target) => {
                let distance = _this.getDistanceTo(target);
                return distance < rst[1] ? [target, distance] : rst;
            },
            [null, Infinity]
        )[0];
    };
}

class System {
    constructor(name) {
        this.name = name;
        this.memory = Memory[this.name] = Memory[this.name] || {};

        import_module();
        define_constant();
        set_prototype();

        this.graphic = new Graphic(this.memory, this);

        this.kernels = _.mapValues(
            (this.memory.kernels = this.memory.kernels || {}),
            (_, name) => new Kernel(name, this.memory.kernels, this)
        );

        this.record_population = new Blackbox(`record_population`, this.memory);
        this.record_cpu_usage = new Blackbox(`record_cpu_usage`, this.memory);
    }
    init() {
        this.cpu_usage = Game.cpu.getUsed();
        this.log = `System ${this.name} run at ${Game.time}:\n`;

        Game.getCreepByName = (name) => Game.creeps[name];
        Game.getRoomByName = (name) => Game.rooms[name];
        Game.getVisualByName = (name) => new RoomVisual(name);
        Game.system = this;
        _.forEach(this.kernels, (kernel, name) => (Game[name] = kernel));

        this.graphic.init();

        _.forEach(this.kernels, (kernel) => kernel.init());
    }
    run() {
        this.record_cpu_usage.tick();
        this.record_population.tick();

        _.forEach(this.kernels, (kernel) => kernel.run());
    }
    shut() {
        this.graphic.shut();

        _.forEach(this.kernels, (kernel) => kernel.shut());

        Memory[this.name] = this.memory;

        console.log(this.log);

        this.record_cpu_usage.record(
            (this.cpu_usage = Game.cpu.getUsed() - this.cpu_usage)
        );
        this.record_population.record(_.keys(Game.creeps).length);
    }
    get report() {
        let report = `Game report at tick ${Game.time}:\n`;
        report += `  System ${this.name}:\n`;
        report += `    CPU usage : ${this.cpu_usage}\n`;
        report += `    Population: ${_.keys(Game.creeps).length}\n\n`;
        _.forEach(this.kernels, (kernel) => (report += kernel.report));
        return report;
    }
    new_kernel(core) {
        delete this.memory.kernels[`k_${core.name}`];
        let kernel = (this.kernels[`k_${core.name}`] = new Kernel(
            `k_${core.name}`,
            this.memory.kernels,
            this
        ));
        Game[core.name] = kernel;
        kernel.init(this.memory.kernels);
        kernel.add_room(core);
        kernel.base_room.set_core(core);
    }
}

module.exports = System;
