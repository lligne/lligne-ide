//
// (C) Copyright 2023-2024 Martin E. Nordberg III
// Apache 2.0 License
//

import {type Keyed} from "../Keyed"
import {type HeadVertexTraversal, type HeteroEdgeTraversal, type HeteroGraph, type TailVertexTraversal} from "../HeteroGraph"
import {someOrNone, type Option} from "../../util/Option";
import {type HeteroEdge} from "../Edges";

//=====================================================================================================================

type VertexKey = symbol

//=====================================================================================================================

/**
 * Mutable implementation of HeteroGraph with at most one tail vertex per head vertex.
 */
export class MutableHeteroGraph1toN<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties>
    implements HeteroGraph<TailVertex, HeadVertex, EdgeProperties> {

    private edgeCount: number
    private readonly edgeIn: Map<VertexKey, HeteroEdge<TailVertex, HeadVertex, EdgeProperties>>
    private readonly edgesOut: Map<VertexKey, HeteroEdge<TailVertex, HeadVertex, EdgeProperties>[]>
    private readonly headVertices: Map<VertexKey, HeadVertex>
    private readonly tailVertices: Map<VertexKey, TailVertex>
    private vertexCount: number

    constructor() {
        this.edgeCount = 0
        this.edgeIn = new Map()
        this.edgesOut = new Map()
        this.headVertices = new Map()
        this.tailVertices = new Map()
        this.vertexCount = 0
    }

    forEachEdge(): HeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties> {
        throw new Error("Not yet implemented")
    }

    forEachHeadVertex(): HeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties> {
        throw new Error("Not yet implemented")
    }

    forEachIncomingEdge(
        callback: (edge: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>) => void
    ) {
        return (vertex: HeadVertex) => {
            const edgeIn = this.edgeIn.get(vertex.key)
            if (edgeIn) {
                callback(edgeIn)
            } else if (!this.hasHeadVertex(vertex)) {
                throw Error("Vertex not present in this graph.")
            }
        }
    }

    forEachInJoinedVertex(
        callback: (vertex: TailVertex) => void
    ) {
        return this.forEachIncomingEdge(edge => {
            callback(edge.tail)
        })
    }

    forEachOutgoingEdge(
        callback: (edge: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>) => void
    ) {
        return (vertex: TailVertex) => {
            const edgesOut = this.edgesOut.get(vertex.key)
            if (edgesOut) {
                edgesOut.forEach(callback)
            } else if (!this.hasTailVertex(vertex)) {
                throw Error("Vertex not present in this graph.")
            }
        }
    }

    forEachOutJoinedVertex(
        callback: (vertex: HeadVertex) => void
    ) {
        return this.forEachOutgoingEdge(edge => {
            callback(edge.head)
        })
    }

    forEachTailVertex(): TailVertexTraversal<TailVertex, HeadVertex, EdgeProperties> {
        throw new Error("Not yet implemented")
    }

    /**
     * Freezes the underlying graph implementation to prevent further mutation.
     */
    freeze(): HeteroGraph<TailVertex, HeadVertex, EdgeProperties> {
        Object.freeze(this.edgeIn)
        Object.freeze(this.edgesOut)
        Object.freeze(this.tailVertices)
        Object.freeze(this.headVertices)
        return this
    }

    hasEdge(edge: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>): boolean {
        const head = edge.head
        const tail = edge.tail
        return this.hasTailVertex(tail) && this.hasHeadVertex(head) &&
            this.edgeIn.get(head.key) === edge &&
            this.edgesOut.get(tail.key)!.includes(edge)
    }

    hasHeadVertex(vertex: HeadVertex): boolean {
        return this.headVertices.has(vertex.key)
    }

    hasTailVertex(vertex: TailVertex): boolean {
        return this.tailVertices.has(vertex.key)
    }

    headVertexWithKey(key: symbol): Option<HeadVertex> {
        return someOrNone(this.headVertices.get(key))
    }

    /**
     * Adds a head vertex to this graph.
     * @param vertex the vertex to add
     */
    #includeHead(vertex: HeadVertex): HeadVertex {
        if (!this.headVertices.get(vertex.key)) {
            this.headVertices.set(vertex.key, vertex)
            if (!this.tailVertices.get(vertex.key)) {
                this.vertexCount += 1
            }
        }
        return vertex
    }

    /**
     * Adds a tail vertex to this graph.
     * @param vertex the vertex to add
     */
    #includeTail(vertex: TailVertex): TailVertex {
        if (!this.tailVertices.get(vertex.key)) {
            this.tailVertices.set(vertex.key, vertex)
            this.edgesOut.set(vertex.key, [])
            if (!this.headVertices.get(vertex.key)) {
                this.vertexCount += 1
            }
        }
        return vertex
    }

    inDegree(vertex: HeadVertex): number {
        return this.edgeIn.get(vertex.key) ? 1 : 0
    }

    /**
     * Adds an edge to this graph from tail to head.
     * @param tail the vertex at the tail of the new edge
     * @param head the vertex at the head of the new edge
     * @param edgeProperties the additional properties of the new edge
     */
    join(
        tail: TailVertex,
        head: HeadVertex,
        edgeProperties: EdgeProperties
    ): HeteroEdge<TailVertex, HeadVertex, EdgeProperties> {
        if (head as any === tail as any) {
            throw Error("Self loops not allowed.")
        }
        if (this.edgeIn.get(head.key)) {
            throw Error("Head vertex is already linked from a different tail.")
        }

        this.#includeTail(tail)
        this.#includeHead(head)

        const result: HeteroEdge<TailVertex, HeadVertex, EdgeProperties> = {
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
        return this.vertexCount
    }

    outDegree(vertex: TailVertex): number {
        return this.edgesOut.get(vertex.key)?.length ?? 0
    }

    get size(): number {
        return this.edgeCount
    }

    tailVertexWithKey(key: symbol): Option<TailVertex> {
        return someOrNone(this.tailVertices.get(key))
    }

}

//=====================================================================================================================

