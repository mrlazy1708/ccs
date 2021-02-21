const Matrix = require("./&matrix");

`use strict`;

class Rooms extends Hash {
    constructor(name, memory, kernel) {
        super(name, memory, kernel);

        this.face = Icons.room;
        this.lable = `${this.face} ${this.key.padEnd(LableLength - 3)}`;

        if (this.memory.center) {
            this.center = new RoomPosition(...this.memory.center, this.name);
        }
        if (this.memory.road_tree) {
            this.road_tree = new Tree(`road_tree`, this.memory);
        }
        if (this.memory.extension) {
            this.extension = _.map(
                this.memory.extension,
                ([x, y]) => new RoomPosition(x, y, this.name)
            );
        }
    }
    init() {
        this.object = Game.rooms[this.key];
        if (this.object) {
            this.object.hash = this;
        } else {
            this.kill();
            this.kernel.remove_hash(this.key);
        }
    }
    check(name) {
        if (this[name]) {
            return true;
        } else {
            this.result(`No ${name} provided!`);
            this.run_one(`plan_${name}`, []);
        }
    }

    plan_terrain() {
        this.result(`OK`);
        this.terrain = Matrix.from_terrain(this.object.getTerrain());
        return true;
    }
    plan_terrain_square() {
        if (this.check(`terrain`)) {
            this.result(`OK`);
            this.terrain_square = this.terrain.to_square(
                (terrain) => terrain == `wall`
            );
            return true;
        }
    }
    plan_cost() {
        if (this.check(`terrain_square`)) {
            this.result(`OK`);
            this.cost = this.terrain_square.to_path_finder((v) =>
                Math.min(10 / v, 255)
            );
            return true;
        }
    }
    plan_pref_controller() {
        if (this.check(`terrain`)) {
            this.result(`OK`);
            this.pref_controller = this.terrain.to_path([
                this.object.controller,
            ]);
            return true;
        }
    }
    plan_pref_mineral() {
        if (this.check(`terrain`)) {
            this.result(`OK`);
            this.pref_mineral = this.terrain.to_path(
                this.object.find(FIND_MINERALS)
            );
            return true;
        }
    }
    plan_pref_source() {
        if (this.check(`terrain`)) {
            this.result(`OK`);
            this.pref_source = this.terrain.to_path(
                this.object.find(FIND_SOURCES)
            );
            return true;
        }
    }
    plan_pref_exit() {
        if (this.check(`terrain`)) {
            this.result(`OK`);
            this.pref_exit = this.terrain.to_path(this.object.find(FIND_EXIT));
            return true;
        }
    }
    plan_pref() {
        if (
            this.check(`pref_controller`) &&
            this.check(`pref_mineral`) &&
            this.check(`pref_source`) &&
            this.check(`pref_exit`) &&
            this.check(`terrain_square`)
        ) {
            this.result(`OK`);
            this.pref = this.pref_controller
                .zip_with(this.pref_mineral, Matrix.max)
                .zip_with(this.pref_source, Matrix.max)
                .zip_with(this.pref_exit, Matrix.div)
                .zip_with(this.terrain_square, Matrix.div);
            return true;
        }
    }
    plan_center() {
        if (this.check(`pref`)) {
            this.result(`OK`);
            this.memory.center = this.pref.poi(Matrix.less);
            this.center = new RoomPosition(
                ...this.memory.center,
                this.object.name
            );
            return true;
        }
    }
    plan_road_tree() {
        if (this.check(`center`) && this.check(`cost`)) {
            // Prim's Algorithm
            this.road_tree = new Tree(`road_tree`, this.memory);
            this.road_map = new Matrix();
            let road = [this.center],
                index = {},
                opened = _.map(
                    _.flatten([
                        this.object.controller,
                        this.object.find(FIND_SOURCES),
                        this.object.find(FIND_MINERALS),
                    ]),
                    (target) =>
                        Object({
                            id: target.id,
                            pos: target.pos.getWorkSite(),
                        })
                );
            this.road_tree.root.memory.x = this.center.x;
            this.road_tree.root.memory.y = this.center.y;
            this.road_map.set(this.center.x, this.center.y, 0);
            _.forEach(opened, (target) =>
                this.cost.set(target.pos.x, target.pos.y, 255)
            );
            for (; opened.length != 0; ) {
                let rst = _.reduce(
                    opened,
                    (rst, target) => {
                        let find = PathFinder.search(target.pos, road, {
                            roomCallback: () => this.cost,
                        });
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
                let register = (node, pos) => {
                        node = node.grow();
                        this.road_map.set(pos.x, pos.y, node.index);
                        node.memory.x = pos.x;
                        node.memory.y = pos.y;
                        road.push(pos);
                        return node;
                    },
                    cross = rst.path.pop(),
                    node = _.reduceRight(
                        rst.path,
                        register,
                        this.road_tree.nodes[
                            this.road_map.get(cross.x, cross.y)
                        ]
                    );
                _.remove(opened, (target) => {
                    if (target.id == rst.id) {
                        index[target.id] = register(node, target.pos).index;
                        return true;
                    }
                });
            }
            return true;
        }
    }
    plan_road_map() {
        if (this.check(`road_tree`)) {
            this.result(`OK`);
            this.road_map = new Matrix();
            this.road_tree.dfs((node) =>
                this.road_map.set(node.memory.x, node.memory.y, node.index)
            );
            return true;
        }
    }
    plan_road_square() {
        if (this.check(`road_map`)) {
            this.result(`OK`);
            this.road_square = this.road_map.to_square(
                (index) => index === undefined
            );
            return true;
        }
    }
    plan_extension() {
        if (this.check(`pref`) && this.check(`road_square`)) {
            let heap = new Heap(``, {}, (e1, e2) => e1[0] > e2[0]);
            for (let y = 0; y < 50; y++) {
                for (let x = 0; x < 50; x++) {
                    if (this.road_square.get(x, y) == 1) {
                        let top = heap.top,
                            value = this.pref.get(x, y);
                        if (!top || top[0] > value) {
                            heap.pop();
                            heap.push([value, x, y]);
                        }
                    }
                }
            }
            heap.memory.shift();
            this.memory.extension = _.map(heap.memory, ([_, x, y]) => [x, y]);
            this.extension = _.map(
                this.memory.extension,
                ([x, y]) => new RoomPosition(x, y, this.name)
            );
        }
    }
    show_matrix(name = `pref`) {
        if (this.check(name)) {
            this.result(`OK`);
            this.system.graphic.erase(this.object.name, name);
            for (let y = 0; y < 50; y++) {
                for (let x = 0; x < 50; x++) {
                    // prettier-ignore
                    this.system.graphic.draw(this.object.name, name, `circle`, x, y, {
                        radius: 0.1 / this[name].get(x, y),
                    });
                }
            }
            return true;
        }
    }
    print(name) {
        if (this.check(name)) {
            this.result(`OK`);
            this[name].print();
            return true;
        }
    }
}

module.exports = Rooms;
