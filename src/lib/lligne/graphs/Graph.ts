//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {type Keyed} from "./Keyed";
import {type Edge} from "./Edges";

//=====================================================================================================================

/**
 * A directed graph where all vertices are the same type.
 */
export class Graph<Vertex extends Keyed, EdgeProperties> {

    private edgeCount: number
    private readonly edgesIn: Map<symbol, Edge<Vertex, EdgeProperties>[]>
    private readonly edgesOut: Map<symbol, Edge<Vertex, EdgeProperties>[]>
    private readonly vertices: Map<symbol, Vertex>

    constructor() {
        this.edgeCount = 0
        this.edgesIn = new Map()
        this.edgesOut = new Map()
        this.vertices = new Map()
    }

    forEachIncomingEdge(vertex: Vertex, callback: (edge: Edge<Vertex, EdgeProperties>) => void) {
        const edgesIn = this.edgesIn.get(vertex.key)
        if (edgesIn) {
            edgesIn.forEach(callback)
        } else if (!this.hasVertex(vertex)) {
            throw Error("Vertex not present in this graph.")
        }
    }

    forEachOutgoingEdge(vertex: Vertex, callback: (edge: Edge<Vertex, EdgeProperties>) => void) {
        const edgesOut = this.edgesOut.get(vertex.key)
        if (edgesOut) {
            edgesOut.forEach(callback)
        } else if (!this.hasVertex(vertex)) {
            throw Error("Vertex not present in this graph.")
        }
    }

    hasEdge(edge: Edge<Vertex, EdgeProperties>): boolean {
        const head = edge.head
        const tail = edge.tail
        return this.hasVertex(tail) && this.hasVertex(head) &&
            this.edgesIn.get(head.key)!.includes(edge) &&
            this.edgesOut.get(tail.key)!.includes(edge)
    }

    hasVertex(v: Vertex): boolean {
        return this.vertices.has(v.key)
    }

    include(vertex: Vertex) {
        if (!this.vertices.get(vertex.key)) {
            this.vertices.set(vertex.key, vertex)
            this.edgesOut.set(vertex.key, [])
            this.edgesIn.set(vertex.key, [])
        }
    }

    inDegree(v: Vertex): number {
        return this.edgesIn.get(v.key)?.length ?? 0
    }

    isSelfLoop(edge: Edge<Vertex, EdgeProperties>): boolean {
        return edge.head === edge.tail
    }

    join(tail: Vertex, head: Vertex, attr: EdgeProperties): Edge<Vertex, EdgeProperties> {
        this.include(tail)
        this.include(head)

        const result: Edge<Vertex, EdgeProperties> = {
            key: Symbol(),
            tail,
            head,
            ...attr
        }

        this.edgeCount += 1
        this.edgesOut.get(tail.key)!.push(result)
        this.edgesIn.get(head.key)!.push(result)

        return result
    }

    order(): number {
        return this.vertices.size
    }

    outDegree(v: Vertex): number {
        return this.edgesOut.get(v.key)?.length ?? 0
    }

    size(): number {
        return this.edgeCount
    }

}

//=====================================================================================================================

