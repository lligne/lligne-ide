import {type Keyed} from "./Keyed";
import {type HomogeneousEdge} from "./Edges";

export interface Tree<Vertex extends Keyed, EdgeProperties> {

    /**
     * Calls the given call back for the edge coming into the given vertex if there is such an edge.
     * @param vertex the vertex with an incoming edge
     * @param callback the function to call with the edge
     */
    forEachIncomingEdge(vertex: Vertex, callback: (edge: HomogeneousEdge<Vertex, EdgeProperties>) => void): void

    /**
     * Calls the given call back for the adjacent vertex with an edge coming into the given vertex (if there
     * is such an edge and vertex).
     * @param vertex the vertex with an incoming edge and connected vertex
     * @param callback the function to call with the edge
     */
    forEachInJoinedVertex(vertex: Vertex, callback: (vertex: Vertex) => void): void

    /**
     * Calls the given call back for each edge going out of the given vertex, if any.
     * @param vertex the vertex with outgoing edges
     * @param callback the function to call with each edge
     */
    forEachOutgoingEdge(vertex: Vertex, callback: (edge: HomogeneousEdge<Vertex, EdgeProperties>) => void): void

    /**
     * Calls the given call back for each adjacent vertex joined by an edge going out of the given vertex.
     * @param vertex the vertex with an incoming edge and connected vertex
     * @param callback the function to call with the edge
     */
    forEachOutJoinedVertex(vertex: Vertex, callback: (vertex: Vertex) => void): void

    /**
     * Tests whether a given edge belongs to this graph.
     * @param edge the edge to check
     */
    hasEdge(edge: HomogeneousEdge<Vertex, EdgeProperties>): boolean

    /**
     * Tests whether a given vertex belongs to this graph.
     * @param vertex the vertex to check
     */
    hasVertex(vertex: Vertex): boolean

    /**
     * The number of edges coming in to the given vertex (0 or 1).
     * @param vertex the vertex to query
     */
    inDegree(vertex: Vertex): number

    /**
     * The number of vertices in the graph.
     */
    get order(): number

    /**
     * The number of edges going out of the given vertex (0 or more).
     * @param vertex the vertex to query
     */
    outDegree(vertex: Vertex): number

    /**
     * The number of edges in the graph.
     */
    get size(): number

}

/**
 * Mutable implementation of Tree. Designed to construct a tree then leave it immutable (frozen).
 */
export class MutableTree<Vertex extends Keyed, EdgeProperties>
    implements Tree<Vertex, EdgeProperties> {

    private edgeCount: number
    private readonly edgeIn: Map<symbol, HomogeneousEdge<Vertex, EdgeProperties>>
    private readonly edgesOut: Map<symbol, HomogeneousEdge<Vertex, EdgeProperties>[]>
    private readonly vertices: Map<symbol, Vertex>

    constructor() {
        this.edgeCount = 0
        this.edgeIn = new Map()
        this.edgesOut = new Map()
        this.vertices = new Map()
    }

    forEachIncomingEdge(vertex: Vertex, callback: (edge: HomogeneousEdge<Vertex, EdgeProperties>) => void) {
        const edgeIn = this.edgeIn.get(vertex.key)
        if (edgeIn) {
            callback(edgeIn)
        } else if (!this.hasVertex(vertex)) {
            throw Error("Vertex not present in this graph.")
        }
    }

    forEachInJoinedVertex(vertex: Vertex, callback: (vertex: Vertex) => void) {
        this.forEachIncomingEdge(vertex, e => {
            callback(e.tail)
        })
    }

    forEachOutgoingEdge(vertex: Vertex, callback: (edge: HomogeneousEdge<Vertex, EdgeProperties>) => void) {
        const edgesOut = this.edgesOut.get(vertex.key)
        if (edgesOut) {
            edgesOut.forEach(callback)
        } else if (!this.hasVertex(vertex)) {
            throw Error("Vertex not present in this graph.")
        }
    }

    forEachOutJoinedVertex(vertex: Vertex, callback: (vertex: Vertex) => void) {
        this.forEachOutgoingEdge(vertex, e => {
            callback(e.head)
        })
    }

    /**
     * Freezes the underlying graph implementation to prevent further mutation.
     */
    freeze(): Tree<Vertex, EdgeProperties> {
        Object.freeze(this.edgeIn)
        Object.freeze(this.edgesOut)
        Object.freeze(this.vertices)
        return this
    }

    hasEdge(edge: HomogeneousEdge<Vertex, EdgeProperties>): boolean {
        const head = edge.head
        const tail = edge.tail
        return this.hasVertex(tail) && this.hasVertex(head) &&
            this.edgeIn.get(head.key) === edge &&
            this.edgesOut.get(tail.key)!.includes(edge)
    }

    hasVertex(vertex: Vertex): boolean {
        return this.vertices.has(vertex.key)
    }

    /**
     * Adds a vertex to this graph.
     * @param vertex the vertex to add
     */
    include(vertex: Vertex): Vertex {
        if (!this.vertices.get(vertex.key)) {
            this.vertices.set(vertex.key, vertex)
            this.edgesOut.set(vertex.key, [])
        }
        return vertex
    }

    inDegree(vertex: Vertex): number {
        return this.edgeIn.get(vertex.key) ? 1 : 0
    }

    /**
     * Adds an edge to this graph from tail to head.
     * @param tail the vertex at the tail of the new edge
     * @param head the vertex at the head of the new edge
     * @param edgeProperties the additional properties of the new edge
     */
    join(tail: Vertex, head: Vertex, edgeProperties: EdgeProperties): HomogeneousEdge<Vertex, EdgeProperties> {
        if (head === tail) {
            throw Error("Self loops not allowed.")
        }
        if (this.edgeIn.get(head.key)) {
            throw Error("Head vertex is already linked from a different tail.")
        }

        this.include(tail)
        this.include(head)

        const result: HomogeneousEdge<Vertex, EdgeProperties> = {
            key: Symbol(),
            tail,
            head,
            ...edgeProperties
        }

        this.edgeCount += 1
        this.edgesOut.get(tail.key)!.push(result)
        this.edgeIn.set(head.key, result)

        return result
    }

    get order(): number {
        return this.vertices.size
    }

    outDegree(vertex: Vertex): number {
        return this.edgesOut.get(vertex.key)?.length ?? 0
    }

    get size(): number {
        return this.edgeCount
    }

}

/**
 * Constructs a tree using a builder callback function.
 * @param build function that builds the tree to completion
 */
export function buildTree<Vertex extends Keyed, EdgeProperties>(
    build: (tree:MutableTree<Vertex, EdgeProperties>)=>void
) : Tree<Vertex, EdgeProperties> {
    const tree: MutableTree<Vertex, EdgeProperties> = new MutableTree()
    build(tree)
    return tree.freeze()
}
