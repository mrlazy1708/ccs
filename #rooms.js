`use strict`;

class Rooms extends Hash {
    constructor(name, memory, kernel) {
        super(name, memory, kernel);

        this.face = IconOf.room;
        this.lable = `${this.face} ${this.key.padEnd(LableLength - 3)}`;
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
    require(name, ...args) {
        if (this[name] || this.memory[`plan_${name}_ok`]) {
            return true;
        } else {
            this.result(`ERR_NO_${name.toUpperCase()}`);
            this.run_one(`plan_${name}`, args);
        }
    }
    check(...names) {
        if (names.length == 0) {
            return true;
        } else {
            let name = names.shift();
            if (this.require(name)) {
                return this.check(...names);
            }
        }
    }
    done_default() {}

    // check_plain_map() {
    //     if (this.plain_map && !this.memory.changed) {
    //         return true;
    //     } else if (this.check(`terrain`)) {
    //         this.result(this.plain_map ? `ERR_CHANGED` : `ERR_NO_CURRENT_MAP`);
    //         this.plain_map = this.terrain.duplicate((terrain) =>
    //             terrain == `wall` ? `wall` : undefined
    //         );
    //         _.forEach(this.object.find(FIND_MY_STRUCTURES), (structure) =>
    //             this.plain_map.set(structure.pos.x, structure.pos.y, structure)
    //         );
    //         delete this.memory.changed;
    //     }
    // }

    plan_terrain() {
        this.result(`OK`);
        this.terrain = new Matrix(`🈳`);
        this.terrain.data = _.chunk(
            _.map(this.object.getTerrain().getRawBuffer(), (value) =>
                value & TERRAIN_MASK_WALL
                    ? `wall`
                    : value & TERRAIN_MASK_SWAMP
                    ? `swamp`
                    : `plain`
            ),
            50
        );
        return true;
    }

    plan_pref_controller() {
        if (this.check(`terrain`)) {
            this.result(`OK`);
            this.pref_controller = this.terrain.find_path([
                this.object.controller,
            ]).distance;
            return true;
        }
    }

    plan_pref_mineral() {
        if (this.check(`terrain`)) {
            this.result(`OK`);
            this.pref_mineral = this.terrain.find_path(
                this.object.find(FIND_MINERALS)
            ).distance;
            return true;
        }
    }

    plan_pref_source() {
        if (this.check(`terrain`)) {
            this.result(`OK`);
            this.pref_source = this.terrain.find_path(
                this.object.find(FIND_SOURCES)
            ).distance;
            return true;
        }
    }

    plan_pref_exit() {
        if (this.check(`terrain`)) {
            this.result(`OK`);
            this.pref_exit = this.terrain.find_path(
                this.object.find(FIND_EXIT)
            ).distance;
            return true;
        }
    }

    plan_pref_openness() {
        if (this.check(`terrain`)) {
            this.result(`OK`);
            this.pref_openness = this.terrain.to_openness(
                (terrain) => terrain == `wall`,
                0
            );
            return true;
        }
    }

    plan_pref() {
        if (
            this.check(
                `pref_controller`,
                `pref_mineral`,
                `pref_source`,
                `pref_exit`,
                `pref_openness`
            )
        ) {
            this.result(`OK`);
            this.pref = this.pref_controller
                .zip_with(this.pref_mineral, Matrix.max)
                .zip_with(this.pref_source, Matrix.max)
                .zip_with(this.pref_exit, Matrix.div)
                .zip_with(this.pref_openness, Matrix.div);
            return true;
        }
    }

    plan_center() {
        if (this.memory.center) {
            this.center = new RoomPosition(...this.memory.center, this.key);
            return true;
        } else if (this.check(`pref`)) {
            this.result(`OK`);
            this.memory.center = this.pref.find_best(Matrix.less);
            this.center = new RoomPosition(...this.memory.center, this.key);
            return true;
        }
    }

    plan_centrality() {
        if (this.check(`terrain`, `center`)) {
            this.result(`OK`);
            this.centrality = this.terrain.find_path([this.center]).distance;
            return true;
        }
    }

    plan_cost_matrix() {
        if (this.check(`pref_openness`)) {
            this.result(`OK`);
            this.cost_matrix = this.pref_openness.to_PathFinder_CostMatrix(
                (v) => Math.min(10 / v, 255)
            );
            return true;
        }
    }

    plan_road_tree() {
        if (this.memory.road_tree) {
            this.road_tree = new Tree(`road_tree`, this.memory);
            return true;
        } else if (this.check(`cost_matrix`)) {
            this.result(`OK`);
            // Prim's Algorithm
            this.road_tree = new Tree(`road_tree`, this.memory);
            this.blueprint = new Matrix();
            let root = this.road_tree.root,
                roads = [this.center],
                opened_targets = _.map(
                    _.flatten([
                        this.object.controller,
                        this.object.find(FIND_SOURCES),
                        this.object.find(FIND_MINERALS),
                    ]),
                    (target) =>
                        Object({
                            id: target.id,
                            pos: target.pos.getWorkSite(),
                            opos: target.pos,
                        })
                );
            root.memory.x = this.center.x;
            root.memory.y = this.center.y;
            this.blueprint.set(this.center.x, this.center.y, root);
            _.forEach(opened_targets, (target) =>
                this.cost_matrix.set(target.pos.x, target.pos.y, 255)
            );
            for (; opened_targets.length != 0; ) {
                let rst = _.reduce(
                    opened_targets,
                    (rst, target) => {
                        let find = PathFinder.search(target.pos, roads, {
                            roomCallback: () => this.cost_matrix,
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
                        let direction = pos.getDirectionTo(node.x, node.y);
                        node = node.grow();
                        this.blueprint.set(pos.x, pos.y, node);
                        node.memory.x = pos.x;
                        node.memory.y = pos.y;
                        node.memory.d = direction;
                        roads.push(pos);
                        return node;
                    },
                    cross = rst.path.pop(),
                    node = _.reduceRight(
                        rst.path,
                        register,
                        this.blueprint.get(cross.x, cross.y)
                    );
                _.remove(opened_targets, (target) => {
                    if (target.id == rst.id) {
                        node = register(node, target.pos);
                        node.binds[target.id] = target.pos.getDirectionTo(
                            target.opos
                        );
                        return true;
                    }
                });
            }
            return true;
        }
    }

    plan_bind_to_tree(pos, key) {
        if (this.check(`road_tree`, `cost_matrix`)) {
            this.result(`OK`);
            
            this.memory[`plan_bind_to_tree${key}`] = true;
            return true;
        }
    }

    plan_blueprint() {
        if (this.check(`terrain`, `road_tree`)) {
            this.result(`OK`);
            this.blueprint = this.terrain.duplicate((terrain) =>
                terrain == `wall` ? `wall` : undefined
            );
            this.road_tree.dfs((node) => {
                this.blueprint.set(node.x, node.y, node);
                _.forEach(node.binds, (dir, key) =>
                    this.blueprint.set(
                        node.x + DeltaOf[dir][0],
                        node.y + DeltaOf[dir][1],
                        key
                    )
                );
            });
            return true;
        }
    }

    plan_spawn() {
        if (this.check(`blueprint`)) {
            this.result(`OK`);

            this.memory.plan_spawn_ok = true;
            return true;
        }
    }

    plan_extension_road() {
        if (this.check(`blueprint`, `road_tree`)) {
            this.result(`OK`);
            let matrix = new Matrix();
            this.extension_road = matrix;
            this.road_tree.dfs((node) =>
                _.forEach(Perpendiculars, ([dx, dy]) => {
                    if (!this.blueprint.get(node.x + dx, node.y + dy)) {
                        matrix.set(node.x + dx, node.y + dy, node);
                    }
                })
            );
            return true;
        }
    }

    plan_extension_heap() {
        if (this.check(`centrality`, `extension_road`)) {
            this.result(`OK`);
            let heap = new Heap(``, {}, (e1, e2) => e1[0] > e2[0]);
            this.extension_heap = heap;
            for (let y = 0; y < 50; y++) {
                for (let x = 0; x < 50; x++) {
                    let road = this.road.get(x, y);
                    if (road instanceof Tree.Node) {
                        let value = this.centrality.get(x, y);
                        if (value) {
                            let top = heap.top;
                            if (heap.size >= 50 && value < top[0]) {
                                heap.pop();
                            }
                            if (heap.size < 50) {
                                heap.push([value, x, y, road]);
                            }
                        }
                    }
                }
            }
            return true;
        }
    }

    plan_extension() {
        if (this.check(`spawn`, `blueprint`, `extension_heap`)) {
            this.result(`OK`);
            let heap = this.extension_heap;
            for (let top = heap.pop(), cnt = 1; top; top = heap.pop(), cnt++) {
                let [_value, x, y, node] = top;
                node.binds[`E${num}`] = node.pos(this.key).getDirectionTo(x, y);
                this.blueprint.set(x, y, `E${num}`);
            }
            this.memory.plan_extension_ok = true;
            return true;
        }
    }

    plan_table() {
        if (this.check(`road_tree`)) {
            this.result(`OK`);
            this.table = {};
            let table = this.table;
            this.road_tree.dfs((node) =>
                _.forEach(node.binds, (_, key) => (table[key] = node.index))
            );
            return true;
        }
    }

    show_matrix(name = `pref`) {
        if (this.check(name)) {
            this.result(`OK`);
            let graphic = this.system.graphic;
            // this.system.graphic.erase(this.key, name);
            for (let y = 0; y < 50; y++) {
                for (let x = 0; x < 50; x++) {
                    // prettier-ignore
                    graphic.draw(this.key, name, `text`,this[name].get(x, y), x, y, { font: `0.5` });
                    // this.system.graphic.draw(this.key, name, `circle`, x, y, {
                    //     radius: 0.1 / this[name].get(x, y),
                    // });
                }
            }
            return true;
        }
    }

    show_map() {
        if (this.check(`blueprint`, `extension`)) {
            this.result(`OK`);
            let graphic = this.system.graphic;
            // this.system.graphic.erase(this.key, `road`);
            this.road_tree.dfs((node) => {
                if (node.father) {
                    // prettier-ignore
                    graphic.draw(this.key, `road`, `line`, node.x, node.y, node.father.x, node.father.y, { color: `red`});
                }
                // prettier-ignore
                graphic.draw(this.key, `road`, `text`, node.index, node.x, node.y, { font: `0.3 American Typewriter`, color: `yellow` });
                _.forEach(node.binds, (dir, key) => {
                    let object = Game.getObjectById(key),
                        x = node.x + DeltaOf[dir][0],
                        y = node.y + DeltaOf[dir][1];
                    key = object ? ShortOf[TypeOf(object)] : key;
                    // prettier-ignore
                    graphic.draw(this.key, `bind`, `text`, key, x, y, { font: `0.3 American Typewriter`, color: `white` });
                });
            });
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
