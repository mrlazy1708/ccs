`use strict`;

function zip2with(m1, m2, map = max) {
    return _.zipWith(m1, m2, (v1, v2) => _.zipWith(v1, v2, map));
}

function div() {
    return (u, v) => u / v;
}

function min(u, v) {
    return Math.min(u, v);
}

function max(u, v) {
    return Math.max(u, v);
}

function max_square(terrain, direction) {
    // prettier-ignore
    let up = [0, 1],
        down = [49, -1],
        info = direction == TOP_LEFT ? [up, up] : direction == TOP_RIGHT ? [down, up] : direction == BOTTOM_RIGHT ? [down, down] : [up, down],
        dp = Square();
    for (let y = info[1][0]; y >= 0 && y < 50; y += info[1][1]) {
        for (let x = info[0][0]; x >= 0 && x < 50; x += info[0][1]) {
            if (terrain[y][x] == `wall`) {
                dp[y][x] = 0;
            } else if (x == info[0][0] || y == info[1][0]) {
                dp[y][x] = 1;
            } else {
                let xp = x - info[0][1],
                    yp = y - info[1][1];
                dp[y][x] = Math.min(dp[yp][xp], dp[y][xp], dp[yp][x]) + 1;
            }
        }
    }
    return dp;
}

function square_matrix(terrain) {
    let matrix = Square(Infinity);
    matrix = zip2with(matrix, max_square(terrain, TOP_LEFT), min);
    matrix = zip2with(matrix, max_square(terrain, TOP_RIGHT), min);
    matrix = zip2with(matrix, max_square(terrain, BOTTOM_RIGHT), min);
    matrix = zip2with(matrix, max_square(terrain, BOTTOM_LEFT), min);
    return matrix;
}

function space_matrix(terrain) {
    let dp = max_square(terrain, TOP_LEFT),
        matrix = Square();
    for (let y = 0; y < 50; y++) {
        let queue = [];
        for (let x = 49; x >= 0; x--) {
            for (; !queue.empty() && queue[0][1] >= x; queue.shift());
            for (; !queue.empty() && queue.last()[0] <= dp[y][x]; queue.pop());
            queue.push([dp[y][x], x - dp[y][x]]);
            matrix[y][x] = queue[0][0];
        }
    }
    for (let x = 0; x < 50; x++) {
        let queue = [];
        for (let y = 49; y >= 0; y--) {
            for (; !queue.empty() && queue[0][1] >= y; queue.shift());
            // prettier-ignore
            for (; !queue.empty() && queue.last()[0] <= matrix[y][x]; queue.pop());
            queue.push([matrix[y][x], y - matrix[y][x]]);
            matrix[y][x] = queue[0][0];
        }
    }
    return matrix;
}

function path_matrix(terrain, starts) {
    let queue = new Heap(`heap`, {}),
        matrix = Square(Infinity);
    _.forEach(starts, (start) => {
        if (!(start instanceof RoomPosition)) {
            start = start.pos;
        }
        if (start instanceof RoomPosition) {
            let x = start.x,
                y = start.y;
            matrix[y][x] = 0;
            queue.push([0, x, y]);
        }
    });
    for (let top = queue.pop(); top; top = queue.pop()) {
        let [d0, x0, y0] = top;
        if (matrix[y0][x0] == d0) {
            _.forEach(Directions, ([dx, dy]) => {
                let x = x0 + dx,
                    y = y0 + dy;
                if (Check(x) && Check(y)) {
                    let d = d0 + MoveCost[terrain[y][x]];
                    if (matrix[y][x] > d) {
                        matrix[y][x] = d;
                        queue.push([d, x, y]);
                    }
                }
            });
        }
    }
    return matrix;
}

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
        let raw = room.terrain(),
            pref = Square();
        pref = zip2with(pref, path_matrix(raw, room.find(FIND_SOURCES)));
        pref = zip2with(pref, path_matrix(raw, room.find(FIND_MINERALS)));
        pref = zip2with(pref, path_matrix(raw, [room.controller]));
        pref = zip2with(pref, path_matrix(raw, room.find(FIND_EXIT)), div());
        pref = zip2with(pref, square_matrix(raw), div());

        let poi = [50, 50, Infinity];
        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                poi = poi[2] > pref[y][x] ? poi : [x, y, pref[y][x]];
            }
        }
        poi = new RoomPosition(poi[0], poi[1], room.name);
        let poi_flag = poi.createFlag();

        this.system.graphic.erase(room.name);
        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                this.system.graphic.draw(room.name, `plan`, `circle`, x, y, {
                    radius: 0.1 / pref[y][x],
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
