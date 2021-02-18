`use strict`;

class Grapihc {
    constructor(memory, system) {
        this.memory = memory.grapihc = memory.grapihc || {};
        this.system = system;
    }
    init() {
        _.forEach(this.memory, (room_memory, room_name) => {
            let visual = new RoomVisual(room_name);
            visual.import(room_memory.visual_data);
        });
        return this;
    }
    draw(room_name, group, type, ...args) {
        let visual = new RoomVisual(room_name),
            room_memory = (this.memory[room_name] = this.memory[room_name] || {
                visual_data: ``,
            }),
            group_memory = (room_memory[group] = room_memory[group] || []);
        group_memory.push([type, args]);
        visual[type](...args);
        return this;
    }
    erase(room_name, group) {
        if (room_name) {
            let visual = new RoomVisual(room_name);
            if (group) {
                delete this.memory[room_name][group];
                _.forEach(this.memory[room_name], ([type, args]) =>
                    visual[type](...args)
                );
            } else {
                delete this.memory[room_name];
                visual.clear();
            }
        } else {
            _.forEach(this.memory, (_, room_name) =>
                this.erase(group, room_name)
            );
        }
        return this;
    }
    shut() {
        _.forEach(this.memory, (room_memory, room_name) => {
            let visual = new RoomVisual(room_name);
            room_memory.visual_data = visual.export();
        });
        return this;
    }
}

module.exports = Grapihc;
