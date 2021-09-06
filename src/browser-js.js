(function (module) {
    /**
     * @license GPL
     * @author Sopur (Someguy1834)
     * @description Optimized QuadTree made by Sopur
     * @about Inspired by https://github.com/timohausmann/quadtree-js because of how unbearably slow it was
     * @warn There is basically no error checking, so that's on you
     */

    class Node {
        /**
         * A Node in the QuadTree
         * @param {number} x The X position on the QuadTree
         * @param {number} y The Y position on the QuadTree
         * @param {number} width The width of the entity on the QuadTree
         * @param {number} height The height of the entity on the QuadTree
         * @param {number|string} identifier Some kind of identifier/pointer to its actual value
         */
        constructor(x, y, width, height, identifier) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.identifier = identifier;
        }
    }

    class Bound {
        /**
         * A bound for a the QuadTree or QuadTree function
         * @param {number} width The width of the bound
         * @param {number} height The height of the bound
         */
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.x = 0;
            this.y = 0;
        }
    }

    class QuadTree {
        /**
         * QuadTree by Sopur
         * @param {Bound} bounds Bounds for X, Y, Width, and Height
         * @param {number} maxObjects Max objects a node can hold before splitting into 4 subnodes
         * @param {number} maxLevels Total max levels for the QuadTree
         * @param {number} depth Total the total depth of the QuadTree
         * @param {number} level The level for sub nodes (Don't set this)
         */
        constructor(bounds, maxObjects = 10, depth = 4, level = 0) {
            this.maxObjects = maxObjects;
            this.maxLevels = depth;
            this.level = level;
            this.bounds = bounds;
            this.objects = [];
            this.objectReferences = [];
            this.nodes = [];
        }

        /**
         * Splits the QuadTree into 4
         * @returns {void}
         * @private
         */
        split() {
            const nextLevel = this.level + 1;
            const width = Math.round(this.bounds.width / 2);
            const height = Math.round(this.bounds.height / 2);
            const x = Math.round(this.bounds.x);
            const y = Math.round(this.bounds.y);

            // Top right
            this.nodes[0] = new QuadTree(
                {
                    x: x + width,
                    y: y,
                    width: width,
                    height: height,
                },
                this.maxObjects,
                this.maxLevels,
                nextLevel
            );

            // Top left
            this.nodes[1] = new QuadTree(
                {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                },
                this.maxObjects,
                this.maxLevels,
                nextLevel
            );

            // Bottom left
            this.nodes[2] = new QuadTree(
                {
                    x: x,
                    y: y + height,
                    width: width,
                    height: height,
                },
                this.maxObjects,
                this.maxLevels,
                nextLevel
            );

            // Bottom right
            this.nodes[3] = new QuadTree(
                {
                    x: x + width,
                    y: y + height,
                    width: width,
                    height: height,
                },
                this.maxObjects,
                this.maxLevels,
                nextLevel
            );
        }

        /**
         * Find the entry for an area in this node
         * @param {Node} object Bounds check area for X, Y, Width, and Height
         * @return {number}	Index of the subnode
         * @private
         */
        getIndex(object) {
            const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
            const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;
            let index = -1;

            // Check if the object can completely fit within the left quadrants
            if (object.x < verticalMidpoint && object.x + object.width < verticalMidpoint) {
                if (object.y < horizontalMidpoint && object.y + object.height < horizontalMidpoint) {
                    index = 1;
                } else if (object.y > horizontalMidpoint) {
                    index = 2;
                }

                // Check if the object can completely fit within the right quadrants
            } else if (object.x > verticalMidpoint) {
                if (object.y < horizontalMidpoint && object.y + object.height < horizontalMidpoint) {
                    index = 0;
                } else if (object.y > horizontalMidpoint) {
                    index = 3;
                }
            }

            return index;
        }

        /**
         * Inserts an object
         * @param {Node} object Object with included X, Y, Width, and Height, and other
         * @return {void}
         * @public
         */
        insert(object) {
            // Push into subnodes
            if (this.nodes[0] !== undefined) {
                const index = this.getIndex(object);
                if (index !== -1) {
                    this.nodes[index].insert(object);
                    return;
                }
            }

            // Otherwise push directly
            this.objects.push(object);

            if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
                if (this.nodes[0] === undefined) {
                    // Make sure it is already split
                    this.split();
                }

                // Add all of the objects to their subnodes
                for (let i = 0; i < this.objects.length; ) {
                    const index = this.getIndex(this.objects[i]);
                    if (index !== -1) {
                        this.nodes[index].insert(this.objects.splice(i, 1)[0]);
                    } else {
                        i++;
                    }
                }
            }
        }

        /**
         * Return all objects that could collide with the given area
         * @param {Node} object Bounds check area for X, Y, Width, and Height
         * @return {Array<Node>} An array with all detected objects
         * @public
         */
        retrieve(object) {
            let returnObjects = this.objects;

            if (this.nodes[0] !== undefined) {
                const index = this.getIndex(object);
                // Check if the object fits into a subnode
                if (index !== -1) {
                    if (
                        this.nodes[index].x > object.x + object.width ||
                        this.nodes[index].x < object.x - object.width ||
                        this.nodes[index].y > object.y + object.height ||
                        this.nodes[index].y < object.y - object.height
                    )
                        return [];
                    returnObjects = returnObjects.concat(this.nodes[index].retrieve(object));

                    // If it does not fit into a subnode, check it against all subnodes
                } else {
                    for (let i = 0; i < this.nodes.length; i++) {
                        if (
                            this.nodes[i].x > object.x + object.width ||
                            this.nodes[i].x < object.x - object.width ||
                            this.nodes[i].y > object.y + object.height ||
                            this.nodes[i].y < object.y - object.height
                        )
                            return [];
                        returnObjects = returnObjects.concat(this.nodes[i].retrieve(object));
                    }
                }
            }

            return returnObjects;
        }

        /**
         * Get the node in which a certain object is stored
         * @param {Node} object The object that was inserted
         * @return {Node} The subnode, or false if it wasn't found
         * @private
         */
        getObjectNode(object) {
            // If there are no subnodes, the object must be here
            if (this.nodes.length === 0) return this;
            const index = this.getIndex(object);

            // If the object does not fit into a subnode, it must be here
            if (index === -1) return this;

            // If it fits into a subnode, continue a deeper search in there
            const node = this.nodes[index].getObjectNode(object);
            if (node) return node;

            return false;
        }

        /**
         * Removes a specific object
         * @param {Node} object The object that was inserted
         * @return {boolean} False: When the object was not found, True: When the object was found
         * @public
         */
        removeObject(object) {
            let node = this.getObjectNode(object);
            const index = node.objects.indexOf(object);

            if (index === -1) return false;
            node.objects.splice(index, 1);
            return true;
        }

        /**
         * Clears everything
         * @returns {void}
         * @public
         */
        clear() {
            this.objects = [];
            if (this.nodes.length === 0) return;
            for (let i = 0; i < this.nodes.length; i++) {
                this.nodes[i].clear();
            }
            this.nodes = [];
        }
    }

    module.HolyQuadTree = { QuadTree, Bound, Node };
})(window);
