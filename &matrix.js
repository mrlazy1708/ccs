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
    get(x, y) {
        return (this.data[y] || [])[x];
    }
    set(x, y, value) {
        (this.data[y] || [])[x] = value;
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
    to_PathFinder_CostMatrix(map) {
        let matrix = new PathFinder.CostMatrix();
        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                matrix.set(x, y, map(this.data[y][x]));
            }
        }
        return matrix;
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
    zip_with(matrix, map) {
        this.data = _.zipWith(this.data, matrix.data, (vector1, vector2) =>
            _.zipWith(vector1, vector2, map)
        );
        return this;
    }
    find_path(starts) {
        let queue = new Heap(`heap`, {}),
            direction_matrix = new Matrix(),
            direction_data = dir.data,
            distance_matrix = new Matrix(Infinity),
            distance_data = dis.data;
        _.forEach(starts, (start) => {
            if (!(start instanceof RoomPosition)) {
                start = start.pos;
            }
            if (start instanceof RoomPosition) {
                let x = start.x,
                    y = start.y;
                distance_data[y][x] = 0;
                queue.push([0, x, y]);
            }
        });
        for (let top = queue.pop(); top; top = queue.pop()) {
            let [d0, x0, y0] = top;
            if (distance_data[y0][x0] == d0) {
                _.forEach(DeltaOf, ([dx, dy], dir) => {
                    let x = x0 + dx,
                        y = y0 + dy;
                    if (Check(x, y)) {
                        let d = d0 + MoveCostOf[this.data[y][x]];
                        if (distance_data[y][x] > d) {
                            distance_data[y][x] = d;
                            direction_data[y][x] = OppositeOf[dir];
                            queue.push([d, x, y]);
                        }
                    }
                });
            }
        }
        return { distance: distance_matrix, direction: direction_matrix };
    }
    to_openness_of(direction, predictor, bound) {
        let check = (value) => (value === undefined ? bound : value),
            [x0, dx, y0, dy] = bound_table[direction],
            matrix = new Matrix(0),
            data = matrix.data;
        for (let y = y0; Check(y); y += dy) {
            for (let x = x0; Check(x); x += dx) {
                data[y][x] = predictor(this.data[y][x])
                    ? 0
                    : Math.min(
                          check((data[y] || [])[x - dx]),
                          check((data[y - dy] || [])[x]),
                          check((data[y - dy] || [])[x - dx])
                      ) + 1;
            }
        }
        return matrix;
    }
    to_openness(pre, bound) {
        return this.to_openness_of(TOP_LEFT, pre, bound)
            .zip_with(this.to_openness_of(TOP_RIGHT, pre, bound), Matrix.min)
            .zip_with(this.to_openness_of(BOTTOM_RIGHT, pre, bound), Matrix.min)
            .zip_with(this.to_openness_of(BOTTOM_LEFT, pre, bound), Matrix.min);
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
