`use strict`;

class Kernel {
    constructor(name, memory) {
        this.name = name;
        this.memory = memory[this.name] = memory[this.name] || {};

        this.memory.objects = this.memory.objects = this.memory.objects || {};
        this.entities = _.mapValues(
            this.memory.objects,
            (_, key) => new Entity(key, this)
        );

        this.execution_queue = new Heap(
            `execution_queue`,
            this.memory,
            (element_1, element_2) => element_1.last_run < element_2.last_run
        );

        this.control_room = new Control_room(this.memory, this);
        this.control_jack = new Control_jack(this.memory, this);
        this.control_spawn = new Control_spawn(this.memory, this);

        this.loss = [];

        this.record_cpu_usage = new Blackbox(`record_cpu_usage`, this.memory);
        this.record_execution = new Blackbox(`record_execution`, this.memory);
        this.record_efficiency = new Blackbox(`record_efficiency`, this.memory);
    }
    init(memory) {
        this.memory = memory[this.name];

        _.forEach(this.entities, (entity) => entity.init(this.memory.objects));

        this.execution_queue.init(this.memory);

        this.control_room.init(this.memory);
        this.control_jack.init(this.memory);
        this.control_spawn.init(this.memory);

        this.record_cpu_usage.init(this.memory);
        this.record_execution.init(this.memory);
        this.record_efficiency.init(this.memory);
    }
    run() {
        this.cpu_usage = Game.cpu.getUsed();
        this.execution_count = 0;
        this.efficiency = 0;

        this.control_jack.run();
        this.control_spawn.run();

        for (
            let execution = this.execution_queue.top;
            execution &&
            execution.last_run < Game.time &&
            Game.cpu.getUsed() < 5;
            execution = this.execution_queue.top
        ) {
            this.execution_queue.pop();
            let entity = this.entities[execution.id];
            if (entity instanceof Entity) {
                this.execution_count++;
                // let a = Game.cpu.getUsed();
                if (entity.run()) {
                    // console.log(Game.cpu.getUsed() - a);
                    this.execution_queue.push({
                        last_run: Game.time,
                        id: execution.id,
                    });
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
            let aftermath = this.loss.pop();
            aftermath;
            aftermath = this.loss.pop()
        ) {
            aftermath();
        }

        this.record_cpu_usage.tick();
        this.record_execution.tick();
        this.record_efficiency.tick();
    }
    get report() {
        let report = `    Kernel ${this.name}:\n`;
        report += `      CPU usage : ${this.cpu_usage}\n`;
        report += `      Execution : ${this.execution_count}\n`;
        report += `      Efficiency: ${this.efficiency}\n\n`;
        return report;
    }
    new_entity(object) {
        this.memory.objects[object.id] = { execution_queue: [] };
        let entity = (this.entities[object.id] = new Entity(object.id, this));
        entity.init(this.memory.objects);
    }
    remove_entity(id) {
        delete this.memory.objects[id];
        delete this.entities[id];
    }
    add_creep(creep) {
        if (!this.entities[creep.id]) {
            this.new_entity(creep);
        }

        this.control_jack.add_jack(creep);
    }
    add_structure(structure) {
        if (!this.entities[structure.id]) {
            this.new_entity(structure);
        }

        this.control_spawn.add_spawn(structure);
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
}

module.exports = Kernel;
