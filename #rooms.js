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
        if (
            this[name] ||
            this.memory[`plan_${name}_ok`] ||
            this.memory[`plan_${name}_${args}_ok`]
        ) {
            return true;
        } else {
            this.result(`ERR_NO_${name.toUpperCase()}`);
            this.run_one(`plan_${name}`, args);
        }
    }
    requires(name, ...argss) {
        if (argss.length == 0) {
            return true;
        } else {
            let args = argss.shift();
            if (this.require(name, ...args)) {
                return this.requires(name, ...argss);
            }
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

    plan_move_cost() {
        if (this.check(`terrain`)) {
            this.result(`OK`);
            this.move_cost = this.terrain.duplicate(
                (terrain) => MoveCostOf[terrain]
            );
            return true;
        }
    }

    plan_pref_controller() {
        if (this.check(`move_cost`)) {
            this.result(`OK`);
            this.pref_controller = this.move_cost.find_path(
                this.object.controller,
                () => false
            ).dis_mat;
            return true;
        }
    }

    plan_pref_mineral() {
        if (this.check(`move_cost`)) {
            this.result(`OK`);
            this.pref_mineral = this.move_cost.find_path(
                this.object.find(FIND_MINERALS),
                () => false
            ).dis_mat;
            return true;
        }
    }

    plan_pref_source() {
        if (this.check(`move_cost`)) {
            this.result(`OK`);
            this.pref_source = this.move_cost.find_path(
                this.object.find(FIND_SOURCES),
                () => false
            ).dis_mat;
            return true;
        }
    }

    plan_pref_exit() {
        if (this.check(`move_cost`)) {
            this.result(`OK`);
            this.pref_exit = this.move_cost.find_path(
                this.object.find(FIND_EXIT),
                () => false
            ).dis_mat;
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
                .duplicate(_.identity)
                .zip_with(this.pref_mineral, Matrix.max)
                .zip_with(this.pref_source, Matrix.max)
                .zip_with(this.pref_exit, Matrix.div)
                .zip_with(this.pref_openness, Matrix.div);
            return true;
        }
    }

    plan_center() {
        if (this.memory.center) {
            this.result(`OK`);
            this.center = new RoomPosition(...this.memory.center, this.key);
            return true;
        } else if (this.check(`pref`)) {
            this.result(`OK`);
            this.memory.center = this.pref.find_best(Matrix.less, () => true);
        }
    }

    plan_bind_cost() {
        if (this.check(`pref_openness`, `road_tree`)) {
            this.result(`OK`);
            this.bind_cost = this.pref_openness.duplicate((v) =>
                Math.min(10 / v, CONSTRUCTION_COST_ROAD_WALL_RATIO)
            );
            this.road_tree.traverse((node) =>
                _.forEach(node.binds, (dir, _) =>
                    this.bind_cost.set(node.pos.move(dir), Infinity)
                )
            );
            return true;
        }
    }

    plan_road_tree() {
        if (this.memory.road_tree) {
            this.result(`OK`);
            this.road_tree = new Tree(`road_tree`, this.memory);
            return true;
        } else if (this.check(`center`)) {
            this.result(`OK`);
            this.road_tree = new Tree(`road_tree`, this.memory);
            this.blueprint = this.terrain.duplicate((terrain) =>
                terrain == `wall` ? `WALL` : undefined
            );
            this.road_tree.root.pos = this.center;
            this.blueprint.set(this.center, this.road_tree.root);
            return true;
        }
    }

    plan_centrality() {
        if (this.check(`move_cost`, `center`)) {
            this.result(`OK`);
            this.centrality = this.move_cost.find_path(
                this.center,
                () => false
            ).dis_mat;
            return true;
        }
    }

    plan_blueprint() {
        if (this.check(`terrain`, `road_tree`)) {
            this.result(`OK`);
            this.blueprint = this.terrain.duplicate((terrain) =>
                terrain == `wall` ? `WALL` : undefined
            );
            this.road_tree.traverse((node) => {
                this.blueprint.set(node.pos, node);
                _.forEach(node.binds, (dir, key) =>
                    this.blueprint.set(node.pos.move(dir), key)
                );
            });
            return true;
        }
    }

    plan_map() {
        if (this.check(`terrain`, `road_tree`)) {
            this.result(`OK`);
            this.map = this.terrain.duplicate((terrain) =>
                terrain == `wall` ? `WALL` : undefined
            );
            this.structures = {};
            let structures = this.object.find(FIND_MY_STRUCTURES);
            _.forEach(structures, (structure) => {
                this.map.set(structure.pos, structure.id);
                this.structures[structure.structureType] =
                    this.structures[structure.structureType] || [];
                this.structures[structure.structureType].push(structure);
            });
            return true;
        }
    }

    plan_bind_to(pos, key) {
        if (this.check(`blueprint`, `bind_cost`)) {
            let find_result = this.bind_cost.find_path(pos, (pos) => {
                return this.blueprint.get(pos) instanceof Tree.Node;
            });
            if (find_result.pos) {
                this.result(`OK`);
                let path = find_result.dir_mat.to_path(find_result.pos),
                    register = (node, dir) => {
                        node = node.grow();
                        node.dir = dir;
                        this.blueprint.set(node.pos, node);
                        return node;
                    },
                    node = _.reduce(
                        path,
                        register,
                        this.blueprint.get(find_result.pos)
                    );
                node.binds[key] = node.pos.getDirectionTo(pos);
                this.blueprint.set(pos, key);
                this.bind_cost.set(pos, Infinity);
                this.memory[`plan_bind_to_${[pos, key]}_ok`] = true;
                return true;
            } else {
                this.result(`ERR_NO_PATH`);
            }
        }
    }

    plan_controller() {
        let controller = this.object.controller;
        if (controller) {
            if (this.require(`bind_to`, controller.pos, controller.id)) {
                this.result(`OK`);
                this.memory.plan_controller_ok = true;
                return true;
            }
        } else {
            this.result(`OK`);
            this.memory.plan_controller_ok = true;
            return true;
        }
    }

    plan_source() {
        let sources = this.object.find(FIND_SOURCES),
            argss = _.map(sources, (source) => [source.pos, source.id]);
        if (this.requires(`bind_to`, ...argss)) {
            this.result(`OK`);
            this.memory.plan_source_ok = true;
            return true;
        }
    }

    plan_mineral() {
        let minerals = this.object.find(FIND_MINERALS),
            argss = _.map(minerals, (mineral) => [mineral.pos, mineral.id]);
        if (this.requires(`bind_to`, ...argss)) {
            this.result(`OK`);
            this.memory.plan_mineral_ok = true;
            return true;
        }
    }

    plan_pos_exits() {
        if (this.memory.pos_exits) {
            this.result(`OK`);
            this.pos_exits = _.mapValues(this.memory.pos_exits, Recover);
            return true;
        } else {
            this.result(`OK`);
            this.memory.pos_exits = {};
            _.forEach(Perpendiculars, (dir) => {
                let exits = this.object.find(
                        global[`FIND_EXIT_${MeaningOf[dir]}`]
                    ),
                    sort = new Heap(``, {}, (p, q) => p.x < q.x || p.y < q.y);
                _.forEach(exits, (exit) => sort.push(exit));
                for (let cnt = 0; cnt < exits.length >> 1; cnt++) {
                    sort.pop();
                }
                if (sort.top) {
                    sort.top.memorize(
                        (this.memory.pos_exits[`E${MeaningOf[dir]}`] = {})
                    );
                }
            });
            return true;
        }
    }

    plan_exit() {
        if (this.check(`pos_exits`)) {
            let argss = _.map(this.pos_exits, (pos, key) => [pos, key]);
            if (this.requires(`bind_to`, ...argss)) {
                this.result(`OK`);
                this.memory.plan_exit_ok = true;
                return true;
            }
        }
    }

    plan_pos_spawns() {
        if (this.memory.pos_spawns) {
            this.result(`OK`);
            this.pos_spawns = _.mapValues(this.memory.pos_spawns, Recover);
            return true;
        } else if (this.check(`pref`, `blueprint`, `map`)) {
            this.result(`OK`);
            this.memory.pos_spawns = [];
            _.forEach(this.structures[STRUCTURE_SPAWN], (spawn) =>
                spawn.pos.memorize((this.memory.pos_spawns[spawn.id] = {}))
            );
            for (
                let index = (this.structures[STRUCTURE_SPAWN] || []).length;
                index < CONTROLLER_STRUCTURES[STRUCTURE_SPAWN][8];
                index++
            ) {
                let [x, y] = this.pref.find_best(
                    Matrix.less,
                    (x, y) =>
                        this.blueprint.get(x, y) === undefined &&
                        this.map.get(x, y) === undefined
                );
                this.blueprint.set(x, y, `SP${index}`);
                new RoomPosition(x, y, this.key).memorize(
                    (this.memory.pos_spawns[`SP${index}`] = {})
                );
            }
            return true;
        }
    }

    plan_spawn() {
        if (this.check(`pos_spawns`)) {
            let argss = _.map(this.pos_spawns, (pos, key) => [pos, key]);
            if (this.requires(`bind_to`, ...argss)) {
                this.result(`OK`);
                this.memory.plan_spawn_ok = true;
                return true;
            }
        }
    }

    plan_road_proximity() {
        if (this.check(`blueprint`)) {
            this.result(`OK`);
            this.road_proximity = this.blueprint.to_openness(
                (object) => object instanceof Tree.Node,
                0
            );
            return true;
        }
    }

    plan_pref_extension() {
        if (this.check(`centrality`, `road_proximity`)) {
            this.result(`OK`);
            this.pref_extension = this.centrality.zip_with(
                this.road_proximity,
                Matrix.mul
            );
            return true;
        }
    }

    plan_pos_extensions() {
        if (this.memory.pos_extensions) {
            this.result(`OK`);
            this.pos_extensions = _.mapValues(
                this.memory.pos_extensions,
                Recover
            );
            return true;
        } else if (this.check(`pref_extension`, `blueprint`, `map`)) {
            this.result(`OK`);
            this.memory.pos_extensions = [];
            _.forEach(this.structures[STRUCTURE_EXTENSION], (extension) =>
                extension.pos.memorize(
                    (this.memory.pos_extensions[extension.id] = {})
                )
            );
            let length = (this.structures[STRUCTURE_EXTENSION] || []).length,
                sum = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][8],
                sort = new Heap(``, {}),
                space = new Matrix();
            for (let y = 0; y < 50; y++) {
                for (let x = 0; x < 50; x++) {
                    if (!this.blueprint.get(x, y) && !this.map.get(x, y)) {
                        let value = this.pref_extension.get(x, y);
                        if (value) {
                            sort.push([value, x, y]);
                        }
                    }
                }
            }
            for (let index = length; index < sum; index++) {
                let top;
                for (top = sort.pop(); sort.size > 0; top = sort.pop()) {
                    let [_, x, y] = top;
                    if (!space.get(x, y) && !this.blueprint.get(x, y)) {
                        break;
                    }
                }
                if (top) {
                    let [__, x, y] = top,
                        pos = new RoomPosition(x, y, this.key);
                    pos.memorize(
                        (this.memory.pos_extensions[`E${index}`] = {})
                    );
                    _.forEach(Perpendiculars, (direction) =>
                        space.set(pos.move(direction), true)
                    );
                }
            }
            return true;
        }
    }

    plan_extension() {
        if (this.check(`pos_extensions`)) {
            let argss = _.map(this.pos_extensions, (pos, key) => [pos, key]);
            if (this.requires(`bind_to`, ...argss)) {
                this.result(`OK`);
                this.memory.plan_extension_ok = true;
                return true;
            }
        }
    }

    plan_all() {
        // prettier-ignore
        if (this.check(`controller`, `source`, `mineral`, `exit`, `spawn`, `extension`)) {
            this.result(`OK`);
            this.memory.plan_all_ok = true;
            return true;
        }
    }

    plan_move_cost_prime() {
        if (this.check(`move_cost`, `road_tree`, `all`)) {
            this.result(`OK`);
            this.road_tree.traverse((node) =>
                _.forEach(node.binds, (dir) =>
                    this.move_cost.set(node.pos.move(dir), 255)
                )
            );
            this.move_cost_prime = this.move_cost;
            delete this.move_cost;
            return true;
        }
    }

    plan_navigate() {
        if (this.check(`road_tree`, `move_cost_prime`, `all`)) {
            this.result(`OK`);
            let roads = this.road_tree.traverse(
                    (node, roads) => (roads.push(node), roads)
                ),
                navigate = this.move_cost_prime.find_path(roads, () => false)
                    .dir_mat;
            this.road_tree.traverse((node) =>
                navigate.set(node.pos, OppositeOf[node.dir])
            );
            this.road_tree.traverse((node, info_s) => {
                node.info = _.mapValues(node.binds, (_) => null);
                _.forEach(info_s, (info, index) =>
                    Object.assign(
                        node.info,
                        _.mapValues(info, (_) => index)
                    )
                );
                return node.info;
            });
            this.navigate = navigate;
            return true;
        }
    }

    show_flow() {
        if (this.check(`navigate`)) {
            this.result(`OK`);
            let graphic = this.system.graphic;
            for (let y = 0; y < 50; y++) {
                for (let x = 0; x < 50; x++) {
                    let dir = this.navigate.get(x, y);
                    if (IconOf[dir]) {
                        // prettier-ignore
                        graphic.draw(this.key, `test`, `text`, IconOf[dir], x, y + 0.4, { font: `1` });
                    }
                }
            }
            return true;
        }
    }

    show_matrix(name) {
        if (this.check(name)) {
            this.result(`OK`);
            let graphic = this.system.graphic;
            // this.system.graphic.erase(this.key, name);
            for (let y = 0; y < 50; y++) {
                for (let x = 0; x < 50; x++) {
                    // prettier-ignore
                    graphic.draw(this.key, name, `text`, this[name].get(x, y), x, y, { font: `0.5` });
                    // this.system.graphic.draw(this.key, name, `circle`, x, y, {
                    //     radius: 0.1 / this[name].get(x, y),
                    // });
                }
            }
            return true;
        }
    }

    show_map() {
        if (this.check(`blueprint`, `all`)) {
            this.result(`OK`);
            let graphic = this.system.graphic;
            // this.system.graphic.erase(this.key, `road`);
            this.road_tree.traverse((node) => {
                if (node.father) {
                    // prettier-ignore
                    graphic.draw(this.key, `road`, `line`, node.pos.x, node.pos.y, node.father.pos.x, node.father.pos.y, { color: `red`});
                }
                // prettier-ignore
                graphic.draw(this.key, `road`, `text`, node.index, node.pos.x, node.pos.y, { font: `0.3 American Typewriter`, color: `yellow` });
                _.forEach(node.binds, (dir, key) => {
                    if (dir) {
                        let object = Game.getObjectById(key),
                            pos = node.pos.move(dir);
                        // key = object ? ShortOf[TypeOf(object)] : key;
                        // prettier-ignore
                        graphic.draw(this.key, `bind`, `text`, key, pos.x, pos.y, { font: `0.3 American Typewriter`, color: `white` });
                    }
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
