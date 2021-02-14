`use strict`;

class Node {
    constructor(memory, tree) {
        this.memory = memory;
        this.tree = tree;

        this.index = this.memory.index;
        this.father = this.tree.nodes[this.memory.father];
        this.children = _.map(
            this.memory.children,
            (index) =>
                (this.tree.nodes[index] = new Node(this.tree.memory, this.tree))
        );
    }
    grow() {
        let memory = {
                index: this.tree.memory.length,
                father: this.memory.index,
                children: [],
            },
            node = new Node(memory, this.tree);
        this.tree.memory.push(memory);
        this.tree.nodes.push(node);
        this.memory.children.push(node.index);
        this.children.push(node);
        return node;
    }
}

class Tree {
    constructor(name, memory) {
        this.memory = memory[name] = memory[name] || [];

        this.nodes = [
            (this.root = new Node(
                (this.memory[0] = this.memory[0] || {
                    index: 0,
                    father: 0,
                    children: [],
                }),
                this
            )),
        ];
    }
}

module.exports = Tree;
