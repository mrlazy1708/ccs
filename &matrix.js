`use strict`;

class Matrix {
    constructor(init) {
        if (init != `🈳`) {
            this.data = Array.from({ length: 50 }, (_) =>
                Array.from({ length: 50 }, (_) => init)
            );
        }
    }
    static from_terrain(terrain) {
        let ret = new Matrix(`🈳`);
        ret.data = _.chunk(
            _.map(terrain.getRawBuffer(), (value) =>
                value & TERRAIN_MASK_WALL
                    ? `wall`
                    : value & TERRAIN_MASK_SWAMP
                    ? `swamp`
                    : `plain`
            ),
            50
        );
        return ret;
    }
    static get min() {
        return (u, v) => Math.min(u, v);
    }
    static get max() {
        return (u, v) => Math.max(u, v);
    }
    static get div() {
        return (u, v) => u / v;
    }
    static get less() {
        return (u, v) => u < v;
    }
    static get greater() {
        return (u, v) => u > v;
    }
    get(x, y) {
        return this.data[y][x];
    }
    set(x, y, value) {
        this.data[y][x] = value;
    }
    to_path_finder(map) {
        let ret = new PathFinder.CostMatrix();
        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                ret.set(x, y, map(this.data[y][x]));
            }
        }
        return ret;
    }
    poi(predictor) {
        let poi = [50, 50, null];
        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                poi =
                    predictor(this.data[y][x], poi[2]) || !poi[2]
                        ? [x, y, this.data[y][x]]
                        : poi;
            }
        }
        return [poi[0], poi[1]];
    }
    zip_with(matrix, map) {
        // console.log(this.data);
        this.data = _.zipWith(this.data, matrix.data, (vector1, vector2) =>
            _.zipWith(vector1, vector2, map)
        );
        return this;
    }
    to_path(starts) {
        let queue = new Heap(`heap`, {}),
            ret = new Matrix(Infinity),
            data = ret.data;
        _.forEach(starts, (start) => {
            if (!(start instanceof RoomPosition)) {
                start = start.pos;
            }
            if (start instanceof RoomPosition) {
                let x = start.x,
                    y = start.y;
                data[y][x] = 0;
                queue.push([0, x, y]);
            }
        });
        for (let top = queue.pop(); top; top = queue.pop()) {
            let [d0, x0, y0] = top;
            if (data[y0][x0] == d0) {
                _.forEach(Directions, ([dx, dy]) => {
                    let x = x0 + dx,
                        y = y0 + dy;
                    if (Check(x) && Check(y)) {
                        let d = d0 + MoveCost[this.data[y][x]];
                        if (data[y][x] > d) {
                            data[y][x] = d;
                            queue.push([d, x, y]);
                        }
                    }
                });
            }
        }
        return ret;
    }
    to_max_square(direction, predictor) {
        // prettier-ignore
        let up = [0, 1],
            down = [49, -1],
            info = direction == TOP_LEFT ? [up, up] : direction == TOP_RIGHT ? [down, up] : direction == BOTTOM_RIGHT ? [down, down] : [up, down],
            ret = new Matrix(0),
            data = ret.data;
        for (let y = info[1][0]; Check(y); y += info[1][1]) {
            for (let x = info[0][0]; Check(x); x += info[0][1]) {
                if (predictor(this.data[y][x])) {
                    data[y][x] = 0;
                } else if (x == info[0][0] || y == info[1][0]) {
                    data[y][x] = 1;
                } else {
                    let xp = x - info[0][1],
                        yp = y - info[1][1];
                    data[y][x] =
                        Math.min(data[yp][xp], data[y][xp], data[yp][x]) + 1;
                }
            }
        }
        return ret;
    }
    to_square(predictor) {
        let ret = new Matrix(Infinity);
        ret.zip_with(this.to_max_square(TOP_LEFT, predictor), Matrix.min)
            .zip_with(this.to_max_square(TOP_RIGHT, predictor), Matrix.min)
            .zip_with(this.to_max_square(BOTTOM_RIGHT, predictor), Matrix.min)
            .zip_with(this.to_max_square(BOTTOM_LEFT, predictor), Matrix.min);
        return ret;
    }
    to_space() {
        let dp = max_square(terrain, TOP_LEFT),
            ret = new Matrix(0),
            data = ret.data;
        for (let y = 0; y < 50; y++) {
            let queue = [];
            for (let x = 49; x >= 0; x--) {
                for (; queue.length != 0 && queue[0][1] >= x; queue.shift());
                // prettier-ignore
                for (; queue.length != 0 && queue[queue.length - 1][0] <= dp[y][x]; queue.pop());
                queue.push([dp[y][x], x - dp[y][x]]);
                data[y][x] = queue[0][0];
            }
        }
        for (let x = 0; x < 50; x++) {
            let queue = [];
            for (let y = 49; y >= 0; y--) {
                for (; queue.length != 0 && queue[0][1] >= y; queue.shift());
                // prettier-ignore
                for (; queue.length != 0 && queue[queue.length - 1][0] <= data[y][x]; queue.pop());
                queue.push([data[y][x], y - data[y][x]]);
                data[y][x] = queue[0][0];
            }
        }
        return ret;
    }
    print() {
        let log = ``;
        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                log += `${this.data[y][x]} `;
            }
            log += `\n`;
        }
        console.log(log);
    }
}

module.exports = Matrix;
