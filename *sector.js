`use strict`;

class Sector extends Asterisk {
    constructor(memory, kernel) {
        super(`sector`, memory, kernel);
        this.memory.rooms = this.memory.rooms || [];
        this.memory.sources = this.memory.sources || [];
        this.memory.sites = this.memory.sites || [];
    }
    init() {
        this.core = Game.getObjectByName(this.memory.core);
        this.update(`rooms`, Game.getObjectByName, `remove_room`);
        this.update(`sources`, Game.getObjectById, `remove_id`);
        this.update(`sites`, Game.getObjectById, `remove_id`);
    }
    plan_room(room) {
        this.system.graphic.erase(room.name);

        let terrain = Matrix.from_terrain(room.getTerrain()),
            square = terrain.to_square(),
            cost = square.to_path_finder((v) => Math.min(10 / v, 255)),
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
                _.flatten([
                    { id: null, pos: center },
                    room.controller,
                    room.find(FIND_SOURCES),
                    room.find(FIND_MINERALS),
                ]),
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
                        _.flatten(closed, road),
                        { roomCallback: () => cost }
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
            _.forEach(rst.path, (pos) => {
                this.system.graphic.draw(
                    room.name,
                    `road`,
                    `circle`,
                    pos.x,
                    pos.y,
                    {
                        fill: `Red`,
                    }
                );
                road.push({ pos: pos, range: 1 });
            });
            _.remove(opened, (target) => {
                if (target.id == rst.id) {
                    closed.push(target);
                    return true;
                }
            });
        }

        let log = ``;
        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                log += `${cost.get(x, y)} `;
                this.system.graphic.draw(room.name, `plan`, `circle`, x, y, {
                    radius: 0.1 / pref.get(x, y),
                });
            }
            log += `\n`;
        }
        // console.log(log);
    }
    add_room(room) {
        this.add_name(`rooms`, room);

        let sources = room.find(FIND_SOURCES);
        _.forEach(sources, (source) => {
            let entity = this.kernel.get_entity(source);
            entity.memory.potential = source.pos.getReachability();
            this.add_id(`sources`, source);
        });

        let sites = room.find(FIND_MY_CONSTRUCTION_SITES);
        _.forEach(sites, (site) => this.add_id(`sites`, site));
    }
    remove_room(room_name) {
        let derive = (id) => {
            let object = Game.getObjectById(id); //monad
            if (object && object.room && object.room.name != room_name) {
                return object;
            }
        };
        this.remove_name(`rooms`, room_name);
        this.update(`sources`, derive, `remove_id`);
        this.update(`sites`, derive, `remove_id`);
    }
    set_core(core) {
        this.memory.core = core.name;
        this.core = core;
    }
}

module.exports = Sector;
