//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {type Keyed} from "./Keyed";
import {type HeteroEdge} from "./Edges";

//=====================================================================================================================

export interface CompositeTree<ParentVertex extends ChildVertex, ChildVertex extends Keyed, EdgeProperties> {

    /**
     * Calls the given call back for the edge coming into the given child vertex if there is such an edge.
     * @param vertex the vertex with an incoming edge
     * @param callback the function to call with the edge
     */
    forEachIncomingEdge(vertex: ChildVertex, callback: (edge: HeteroEdge<ParentVertex, ChildVertex, EdgeProperties>) => void): void

    /**
     * Calls the given call back for the adjacent parent vertex with an edge coming into the given vertex (if there
     * is such an edge and vertex).
     * @param vertex the vertex with an incoming edge and connected vertex
     * @param callback the function to call with the edge
     */
    forEachInJoinedVertex(vertex: ChildVertex, callback: (vertex: ParentVertex) => void): void

    /**
     * Calls the given call back for each edge going out of the given vertex, if any.
     * @param vertex the vertex with outgoing edges
     * @param callback the function to call with each edge
     */
    forEachOutgoingEdge(vertex: ParentVertex, callback: (edge: HeteroEdge<ParentVertex, ChildVertex, EdgeProperties>) => void): void

    /**
     * Calls the given call back for each adjacent vertex joined by an edge going out of the given vertex.
     * @param vertex the vertex with an incoming edge and connected vertex
     * @param callback the function to call with the edge
     */
    forEachOutJoinedVertex(vertex: ParentVertex, callback: (vertex: ChildVertex) => void): void

    /**
     * Tests whether a given edge belongs to this graph.
     * @param edge the edge to check
     */
    hasEdge(edge: HeteroEdge<ParentVertex, ChildVertex, EdgeProperties>): boolean

    /**
     * Tests whether a given child vertex belongs to this graph.
     * @param vertex the vertex to check
     */
    hasHeadVertex(vertex: ChildVertex): boolean

    /**
     * Tests whether a given parent vertex belongs to this graph.
     * @param vertex the vertex to check
     */
    hasTailVertex(vertex: ParentVertex): boolean

    /**
     * The number of edges coming in to the given child vertex (0 or 1).
     * @param vertex the vertex to query
     */
    inDegree(vertex: ChildVertex): number

    /**
     * The number of vertices in the graph.
     */
    get order(): number

    /**
     * The number of edges going out of the given parent vertex (0 or more).
     * @param vertex the vertex to query
     */
    outDegree(vertex: ParentVertex): number

    /**
     * The number of edges in the graph.
     */
    get size(): number

}

//=====================================================================================================================

/**
 * Mutable implementation of CompositeTree. Designed to construct a tree then leave it immutable (frozen).
 */
export class MutableCompositeTree<ParentVertex extends ChildVertex, ChildVertex extends Keyed, EdgeProperties>
    implements CompositeTree<ParentVertex, ChildVertex, EdgeProperties> {

    private edgeCount: number
    private readonly edgeIn: Map<symbol, HeteroEdge<ParentVertex, ChildVertex, EdgeProperties>>
    private readonly edgesOut: Map<symbol, HeteroEdge<ParentVertex, ChildVertex, EdgeProperties>[]>
    private readonly headVertices: Map<symbol, ChildVertex>
    private readonly tailVertices: Map<symbol, ParentVertex>

    constructor() {
        this.edgeCount = 0
        this.edgeIn = new Map()
        this.edgesOut = new Map()
        this.headVertices = new Map()
        this.tailVertices = new Map()
    }

    forEachIncomingEdge(vertex: ChildVertex, callback: (edge: HeteroEdge<ParentVertex, ChildVertex, EdgeProperties>) => void) {
        const edgeIn = this.edgeIn.get(vertex.key)
        if (edgeIn) {
            callback(edgeIn)
        } else if (!this.hasHeadVertex(vertex)) {
            throw Error("Vertex not present in this graph.")
        }
    }

    forEachInJoinedVertex(vertex: ChildVertex, callback: (vertex: ParentVertex) => void) {
        this.forEachIncomingEdge(vertex, e => {
            callback(e.tail)
        })
    }

    forEachOutgoingEdge(vertex: ParentVertex, callback: (edge: HeteroEdge<ParentVertex, ChildVertex, EdgeProperties>) => void) {
        const edgesOut = this.edgesOut.get(vertex.key)
        if (edgesOut) {
            edgesOut.forEach(callback)
        } else if (!this.hasTailVertex(vertex)) {
            throw Error("Vertex not present in this graph.")
        }
    }

    forEachOutJoinedVertex(vertex: ParentVertex, callback: (vertex: ChildVertex) => void) {
        this.forEachOutgoingEdge(vertex, e => {
            callback(e.head)
        })
    }

    /**
     * Freezes the underlying graph implementation to prevent further mutation.
     */
    freeze(): CompositeTree<ParentVertex, ChildVertex, EdgeProperties> {
        Object.freeze(this.edgeIn)
        Object.freeze(this.edgesOut)
        Object.freeze(this.tailVertices)
        Object.freeze(this.headVertices)
        return this
    }

    hasEdge(edge: HeteroEdge<ParentVertex, ChildVertex, EdgeProperties>): boolean {
        const head = edge.head
        const tail = edge.tail
        return this.hasTailVertex(tail) && this.hasHeadVertex(head) &&
            this.edgeIn.get(head.key) === edge &&
            this.edgesOut.get(tail.key)!.includes(edge)
    }

    hasHeadVertex(vertex: ChildVertex): boolean {
        return this.headVertices.has(vertex.key)
    }

    hasTailVertex(vertex: ParentVertex): boolean {
        return this.tailVertices.has(vertex.key)
    }

    /**
     * Adds a child vertex to this graph.
     * @param vertex the vertex to add
     */
    #includeHead(vertex: ChildVertex): ChildVertex {
        if (!this.headVertices.get(vertex.key)) {
            this.headVertices.set(vertex.key, vertex)
        }
        return vertex
    }

    /**
     * Adds a parent vertex to this graph.
     * @param vertex the vertex to add
     */
    #includeTail(vertex: ParentVertex): ParentVertex {
        if (!this.tailVertices.get(vertex.key)) {
            this.tailVertices.set(vertex.key, vertex)
            this.edgesOut.set(vertex.key, [])
        }
        return vertex
    }

    inDegree(vertex: ChildVertex): number {
        return this.edgeIn.get(vertex.key) ? 1 : 0
    }

    /**
     * Adds an edge to this graph from tail to head.
     * @param tail the vertex at the tail of the new edge
     * @param head the vertex at the head of the new edge
     * @param edgeProperties the additional properties of the new edge
     */
    join(tail: ParentVertex, head: ChildVertex, edgeProperties: EdgeProperties): HeteroEdge<ParentVertex, ChildVertex, EdgeProperties> {
        if (head as any === tail as any) {
            throw Error("Self loops not allowed.")
        }
        if (this.edgeIn.get(head.key)) {
            throw Error("Head vertex is already linked from a different tail.")
        }

        this.#includeTail(tail)
        this.#includeHead(head)

        const result: HeteroEdge<ParentVertex, ChildVertex, EdgeProperties> = {
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
        return this.edgeCount + 1
    }

    outDegree(vertex: ParentVertex): number {
        return this.edgesOut.get(vertex.key)?.length ?? 0
    }

    get size(): number {
        return this.edgeCount
    }

}

//=====================================================================================================================

