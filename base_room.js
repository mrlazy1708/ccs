`use strict`;

class Base_room extends Base {
    constructor(memory, kernel) {
        super(`room`, memory, kernel);
        this.memory.rooms = this.memory.rooms || [];
        this.memory.sources = this.memory.sources || [];
    }
    init() {
        this.core = Game.getRoomByName(this.memory.core);
        this.update(`rooms`, Game.getRoomByName, `remove_room`);
        this.update(`sources`, Game.getObjectById, `remove_structure`);
    }
    plan_room(room) {
        let terrain = Matrix.from_terrain(room.getTerrain()),
            square = terrain.to_square(),
            cost = square.to_path_finder((v) =>
                Math.min(Math.round(100 / v), 255)
            ),
            pref = terrain
                .to_path([room.controller])
                .zip_with(terrain.to_path(room.find(FIND_MINERALS)), Matrix.max)
                .zip_with(terrain.to_path(room.find(FIND_SOURCES)), Matrix.max)
                .zip_with(terrain.to_path(room.find(FIND_EXIT)), Matrix.div)
                .zip_with(square, Matrix.div),
            center = pref.poi();
        center = new RoomPosition(center[0], center[1], room.name);

        // Prim's Algorithm
        let road = [],
            closed = [],
            opened = _.map(
                _.concat(
                    room.controller,
                    room.find(FIND_SOURCES),
                    room.find(FIND_MINERALS)
                ),
                (target) =>
                    Object({
                        id: target.id,
                        pos: target.pos.getWorkSite(),
                        range: 1,
                    })
            );
        _.forEach(opened, (target) =>
            cost.set(target.pos.x, target.pos.y, 255)
        );
        for (; opened.length != 0; ) {
            let rst = _.reduce(
                opened,
                (rst, target) => {
                    let find = PathFinder.search(
                        target.pos,
                        _.concat(closed, road)
                    );
                    if (find.incomplete) {
                        return rst;
                    } else if (rst) {
                        if (find.path.length < rst.path.length) {
                            return { id: target.id, path: find.path };
                        } else {
                            return rst;
                        }
                    } else {
                        return { id: target.id, path: find.path };
                    }
                },
                null
            );
            _.forEach(rst.path, (pos) => road.push({ pos: pos, range: 1 }));
            _.remove(opened, (target) => {
                if (target.id == rst.id) {
                    closed.push(target);
                    return true;
                }
            });
        }

        this.system.graphic.erase(room.name);
        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                this.system.graphic.draw(room.name, `plan`, `circle`, x, y, {
                    radius: 0.1 / pref.get(x, y),
                });
            }
        }
    }
    add_room(room) {
        this.add(`rooms`, Game.getRoomByName, room.name);

        let sources = room.find(FIND_SOURCES);
        _.forEach(sources, (source) => {
            let entity = this.kernel.new_entity(source);
            entity.memory.potential = source.pos.getReachability();
            this.add(`sources`, Game.getObjectById, source.id);
        });
    }
    set_core(core) {
        this.memory.core = core.name;
        this.core = core;
    }
    remove_room(room_name) {
        this.remove(`rooms`, Game.getRoomByName, room_name);
        this.update(`sources`, Game.getObjectByName, this.remove_structure);
    }
}

module.exports = Base_room;
