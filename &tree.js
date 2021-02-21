`use strict`;

class Node {
    constructor(index, memory, tree) {
        this.index = index;
        this.memory = memory[index] = memory[index] || {};
        this.tree = tree;

        this.father = this.tree.nodes[this.memory.father];
        this.children = _.map(
            (this.memory.children = this.memory.children || []),
            (index) =>
                (this.tree.nodes[index] = new Node(
                    index,
                    this.tree.memory,
                    this.tree
                ))
        );
    }
    grow() {
        this.tree.memory.push({ father: this.index });
        let node = new Node(
            this.tree.nodes.length,
            this.tree.memory,
            this.tree
        );
        this.tree.nodes.push(node);
        this.memory.children.push(node.index);
        this.children.push(node);
        return node;
    }
    dfs(apply) {
        let result = _.map(this.children, (child) => child.dfs(apply));
        return apply(this, result);
    }
    print(log, depth) {
        return _.reduce(
            this.children,
            ([log, indent], child) => [
                child.print(log + indent, depth + 1),
                `\n` + ` `.repeat(depth << 2),
            ],
            [log + this.index.toString().padEnd(4), ``]
        )[0];
    }
}

class Tree {
    constructor(name, memory) {
        this.memory = memory[name] = memory[name] || [];

        this.nodes = [];
        this.nodes[0] = this.root = new Node(0, this.memory, this);
    }
    dfs(apply) {
        return this.root.dfs(apply);
    }
    print() {
        console.log(this.root.print(``, 1));
    }
}

module.exports = Tree;
