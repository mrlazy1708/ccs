`use strict`;

let bound_table = {
    [TOP_RIGHT]: [49, -1, 0, 1],
    [BOTTOM_RIGHT]: [49, -1, 49, -1],
    [BOTTOM_LEFT]: [0, 1, 49, -1],
    [TOP_LEFT]: [0, 1, 0, 1],
};

class Matrix {
    constructor(init) {
        if (init != `🈳`) {
            this.data = Array.from({ length: 50 }, (_) =>
                Array.from({ length: 50 }, (_) => init)
            );
        }
    }
    static get min() {
        return (u, v) => Math.min(u, v);
    }
    static get max() {
        return (u, v) => Math.max(u, v);
    }
    static get mul() {
        return (u, v) => u * v;
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
    get_xy(x, y) {
        return (this.data[y] || [])[x];
    }
    get_pos(pos) {
        return this.get_xy(pos.x, pos.y);
    }
    get(arg1, arg2) {
        if (arg1 instanceof RoomPosition) {
            return this.get_pos(arg1);
        } else {
            return this.get_xy(arg1, arg2);
        }
    }
    set_xy(x, y, value) {
        (this.data[y] || [])[x] = value;
    }
    set_pos(pos, value) {
        this.set_xy(pos.x, pos.y, value);
    }
    set(arg1, arg2, arg3) {
        if (arg1 instanceof RoomPosition) {
            this.set_pos(arg1, arg2);
        } else {
            this.set_xy(arg1, arg2, arg3);
        }
    }
    duplicate(map) {
        let matrix = new Matrix(`🈳`);
        matrix.data = _.map(this.data, (vector) => _.map(vector, map));
        return matrix;
    }
    transform(map) {
        this.data = _.map(this.data, (vector) => _.map(vector, map));
        return this;
    }
    zip_with(matrix, map) {
        this.data = _.zipWith(this.data, matrix.data, (vector1, vector2) =>
            _.zipWith(vector1, vector2, map)
        );
        return this;
    }
    find_best(predictor, validator) {
        let find_best = [50, 50, null];
        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                if (validator(x, y)) {
                    find_best =
                        predictor(this.data[y][x], find_best[2]) ||
                        !find_best[2]
                            ? [x, y, this.data[y][x]]
                            : find_best;
                }
            }
        }
        return [find_best[0], find_best[1]];
    }
    find_path(origin, predictor) {
        let dijk_queue = new Heap(`heap`, {}),
            dis_mat = new Matrix(Infinity),
            dir_mat = new Matrix(),
            starts = origin instanceof Array ? origin : [origin];
        _.forEach(starts, (start) => {
            if (!(start instanceof RoomPosition)) {
                start = start.pos;
            }
            if (start instanceof RoomPosition) {
                dis_mat.set_pos(start, 0);
                dijk_queue.push([0, start]);
            }
        });
        for (let top = dijk_queue.pop(); top; top = dijk_queue.pop()) {
            let [d0, pos0] = top;
            if (dis_mat.get_pos(pos0) == d0) {
                if (predictor(pos0)) {
                    return { dis_mat: dis_mat, dir_mat: dir_mat, pos: pos0 };
                }
                _.forEach(Directions, (direction) => {
                    let pos = pos0.move(direction);
                    if (pos) {
                        let d = d0 + this.get_pos(pos);
                        if (dis_mat.get_pos(pos) > d) {
                            dis_mat.set_pos(pos, d);
                            dir_mat.set_pos(pos, OppositeOf[direction]);
                            dijk_queue.push([d, pos]);
                        }
                    }
                });
            }
        }
        return { dis_mat: dis_mat, dir_mat: dir_mat };
    }
    to_path(start) {
        let pos = new RoomPosition(start.x, start.y, start.roomName),
            path = [];
        for (let dir = this.get_pos(pos); dir; dir = this.get_pos(pos)) {
            path.push(dir);
            pos.moveTo(dir);
        }
        path.pop();
        return path;
    }
    to_openness_toward(direction, predictor, bound) {
        let check = (value) => (value === undefined ? bound : value),
            [x0, dx, y0, dy] = bound_table[direction],
            openness = new Matrix();
        for (let y = y0; Check(y); y += dy) {
            for (let x = x0; Check(x); x += dx) {
                // prettier-ignore
                openness.set_xy(x, y,
                    predictor(this.get_xy(x, y))
                        ? 0
                        : Math.min(
                              check(openness.get_xy(x - dx, y)),
                              check(openness.get_xy(x, y - dy)),
                              check(openness.get_xy(x - dx, y - dy))
                          ) + 1
                );
            }
        }
        return openness;
    }
    to_openness(predictor, bound) {
        // prettier-ignore
        return this.to_openness_toward(TOP_LEFT, predictor, bound)
            .zip_with(this.to_openness_toward(TOP_RIGHT, predictor, bound), Matrix.min)
            .zip_with(this.to_openness_toward(BOTTOM_RIGHT, predictor, bound), Matrix.min)
            .zip_with(this.to_openness_toward(BOTTOM_LEFT, predictor, bound), Matrix.min);
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
