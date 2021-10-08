const { QuadTree, Bound, Node } = require("./src/node-js");
const qt = new QuadTree(new Bound(1000, 1000), 10, 1000);
const insert = 600;
const retrieve = 600;

console.log(`Inserting ${insert} nodes...`);
console.time();
for (let i = 0; i < insert; i++) {
    qt.insert(new Node(i, i, 10, 10, i));
}
console.timeEnd();

console.log(`retrieving ${retrieve} nodes...`);
console.time();
for (let i = 0; i < retrieve; i++) {
    qt.retrieve(new Node(i, i, 50, 50));
}
console.timeEnd();
