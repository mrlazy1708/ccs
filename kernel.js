`use strict`;

class Kernel {
    constructor(name, memory) {
        this.name = name;
        this.memory = memory[this.name] = memory[this.name] || {};

        this.object_memory = this.memory.object = this.memory.object || {};
        this.executions = _.mapValues(
            this.object_memory,
            (_, key) => new Execution(key, this)
        );

        this.execution_heap = new Heap(
            `execution_heap`,
            this.memory,
            (element_1, element_2) => element_1.last_run < element_2.last_run
        );

        this.control_jack = new Control_jack(this.memory, this);
        this.control_spawn = new Control_spawn(this.memory, this);
    }
    init(memory) {
        this.memory = memory[this.name];

        this.object_memory = this.memory.object;
        _.forEach(this.executions, (execution) =>
            execution.init(this.object_memory)
        );

        this.execution_heap.init(this.memory);

        this.control_jack.init(this.memory);
        this.control_spawn.init(this.memory);
    }
    run() {
        this.control_jack.run();
        this.control_spawn.run();

        for (
            let element = this.execution_heap.top;
            element && element.last_run < Game.time && Game.cpu.getUsed() < 5;
            element = this.execution_heap.top
        ) {
            this.execution_heap.pop();
            let execution = this.executions[element.id];
            if (execution instanceof Execution) {
                if (execution.run()) {
                    this.execution_heap.push({
                        last_run: Game.time,
                        id: element.id,
                    });
                } else {
                    console.log(`finish~`);
                }
            }
        }
    }
    shut() {}
    add1(id) {
        this.object_memory[id] = { execution_queue: [] };
        this.executions[id] = new Execution(id, this);
        this.executions[id].init(this.object_memory);

        this.control_jack.add(id);
    }
    add2(id) {
        this.object_memory[id] = { execution_queue: [] };
        this.executions[id] = new Execution(id, this);
        this.executions[id].init(this.object_memory);

        this.control_spawn.add(id);
    }
    execute(id, type, data) {
        let execution = this.executions[id];
        if (execution.type == `idle`) {
            this.execution_heap.push({ last_run: Game.time, id: id });
        }
        this.object_memory[id].execution_queue.push({ type: type, data: data });
    }
    remove(id) {
        this.control_jack.remove(id);
        delete this.object_memory[id];
        delete this.executions[id];
    }
}

module.exports = Kernel;
