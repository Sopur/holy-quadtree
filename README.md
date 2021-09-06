# Sopur's QuadTree library

    This project was inspired by Timohausmann's "quadtree-js" and how slow it was
    This library is extremely optimized to the point of being able to handle millions of inserts and retrieves in less than a second

# Why I made this

    A lot of the QuadTree's I found were so unbearably slow that I had to make my own
    ...
    And one of my friends made a QuadTree in C++ that was (legit) 10x slower
    So just to flex I'm making this public

# How to use

    Please look at the source for details, or just look below for examples

# Basic example

```js
const QuadTree = require("holy-quadtree");
const qt = new QuadTree.QuadTree(
    new QuadTree.Bound(100, 100), // Width, height
    10, // Max objects before splitting
    100 // Max depth
); // Please look at the source for more details/comments

// Make everything
const Node1 = new QuadTree.Node(
    10, // X
    10, // Y
    20, // Width
    20, // Height
    "Test1" // Identifier
);
const Node2 = new QuadTree.Node(
    10, // X
    10, // Y
    20, // Width
    20, // Height
    "Test2" // Identifier
);

// Insert everything thing
qt.insert(Node1);
qt.insert(Node2);

// Retrieve what we have
qt.retrieve(
    new QuadTree.Node(
        5, // X
        5, // Y
        30, // Width
        30 // Height
    ) // Search area
); // Returns: [Node] x2

// Lets remove an object (Second one)
qt.removeObject(Node2);

// Lets try retrieving again
qt.retrieve(
    new QuadTree.Node(
        5, // X
        5, // Y
        30, // Width
        30 // Height
    ) // Search area
); // Returns: [Node] x1
// 2nd object was removed!

qt.clear(); // Deallocate everything
```
