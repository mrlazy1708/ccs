const Control_spy = require("./control_spy");

`use strict`;

class Kernel {
    constructor(name, memory) {
        this.name = name;
        this.memory = memory[this.name] = memory[this.name] || {};

        this.memory.entities = this.memory.entities =
            this.memory.entities || {};
        this.entities = _.mapValues(
            this.memory.entities,
            (_, id, memory) => new Entity(id, memory, this)
        );

        this.execution_queue = new Heap(
            `execution_queue`,
            this.memory,
            (element_1, element_2) => element_1[0] < element_2[0]
        );

        this.control_room = new Control_room(this.memory, this);
        this.control_jack = new Control_jack(this.memory, this);
        this.control_spawn = new Control_spawn(this.memory, this);
        this.control_spy = new Control_spy(this.memory, this);

        this.spawn_queue = this.control_spawn.spawn_queue;
        this.mission_queue = this.control_spy.mission_queue;
        this.funeral = [];

        this.record_cpu_usage = new Blackbox(`record_cpu_usage`, this.memory);
        this.record_execution = new Blackbox(`record_execution`, this.memory);
        this.record_efficiency = new Blackbox(`record_efficiency`, this.memory);
    }
    init() {
        _.forEach(this.entities, (entity) => entity.init());

        this.control_room.init();
        this.control_jack.init();
        this.control_spawn.init();
        this.control_spy.init();
    }
    run() {
        this.record_cpu_usage.tick();
        this.record_execution.tick();
        this.record_efficiency.tick();

        this.cpu_usage = Game.cpu.getUsed();
        this.execution_count = 0;
        this.efficiency = 0;

        this.control_jack.run();
        this.control_spawn.run();
        this.control_spy.run();

        for (
            let execution = this.execution_queue.top;
            execution && execution[0] < Game.time && Game.cpu.getUsed() < 5;
            execution = this.execution_queue.top
        ) {
            this.execution_queue.pop();
            let entity = this.entities[execution[1]];
            if (entity) {
                this.execution_count++;
                // let a = Game.cpu.getUsed();
                if (entity.run()) {
                    // console.log(Game.cpu.getUsed() - a);
                    this.execution_queue.push([Game.time, execution[1]]);
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
        for (
            let affair = this.funeral.pop();
            affair;
            affair = this.funeral.pop()
        ) {
            affair();
        }
    }
    get report() {
        let report = `    Kernel ${this.name}:\n`;
        report += `      CPU usage : ${this.cpu_usage}\n`;
        report += `      Execution : ${this.execution_count}\n`;
        report += `      Efficiency: ${this.efficiency}\n\n`;
        return report;
    }
    new_entity(object) {
        let entity = (this.entities[object.id] = new Entity(
            object.id,
            this.memory.entities,
            this
        ));
        entity.init(this.memory.entities);
        return entity;
    }
    remove_entity(id) {
        delete this.memory.entities[id];
        delete this.entities[id];
    }
    add_creep(creep) {
        if (this.entities[creep.id]) {
            return this.entities[creep.id];
        }

        let entity = this.new_entity(creep);
        console.log(entity.role);
        if (entity.role == `jack`) {
            this.control_jack.add_jack(creep);
        }
        if (entity.role == `spy`) {
            this.control_spy.add_spy(creep);
        }

        return entity;
    }
    add_structure(structure) {
        if (this.entities[structure.id]) {
            return this.entities[structure.id];
        }

        let entity = this.new_entity(structure);

        this.control_spawn.add_spawn(structure);

        return entity;
    }
    add_room(room) {
        this.control_room.add_room(room);

        let creeps = room.find(FIND_MY_CREEPS);
        _.forEach(creeps, (creep) => this.add_creep(creep));

        let spawns = room.find(FIND_MY_SPAWNS);
        _.forEach(spawns, (spawn) => this.add_structure(spawn));
    }
    set_core(core) {
        this.control_room.set_core(core);
    }
    add_remote(room_name) {
        this.mission_queue.push([Game.time, `spy`, [room_name]]);
    }
}

module.exports = Kernel;
