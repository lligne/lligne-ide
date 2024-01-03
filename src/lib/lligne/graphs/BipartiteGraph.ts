//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {type Keyed} from "./Keyed";
import {type HeteroEdge} from "./Edges";

//=====================================================================================================================

export class BipartiteGraph<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties> {

    private edgeCount: number
    private readonly edgesIn: Map<symbol, HeteroEdge<TailVertex, HeadVertex, EdgeProperties>[]>
    private readonly edgesOut: Map<symbol, HeteroEdge<TailVertex, HeadVertex, EdgeProperties>[]>
    private readonly tailVertices: Map<symbol, TailVertex>
    private readonly headVertices: Map<symbol, HeadVertex>

    constructor() {
        this.edgeCount = 0
        this.edgesIn = new Map()
        this.edgesOut = new Map()
        this.tailVertices = new Map()
        this.headVertices = new Map()
    }

    forEachIncomingEdge(vertex: HeadVertex, callback: (edge: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>) => void) {
        const edgesIn = this.edgesIn.get(vertex.key)
        if (edgesIn) {
            edgesIn.forEach(callback)
        } else if (!this.hasHeadVertex(vertex)) {
            throw Error("Vertex not present in this graph.")
        }
    }

    forEachOutgoingEdge(vertex: TailVertex, callback: (edge: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>) => void) {
        const edgesOut = this.edgesOut.get(vertex.key)
        if (edgesOut) {
            edgesOut.forEach(callback)
        } else if (!this.hasTailVertex(vertex)) {
            throw Error("Vertex not present in this graph.")
        }
    }

    hasEdge(edge: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>): boolean {
        const head = edge.head
        const tail = edge.tail
        return this.hasTailVertex(tail) && this.hasHeadVertex(head) &&
            this.edgesIn.get(head.key)!.includes(edge) &&
            this.edgesOut.get(tail.key)!.includes(edge)
    }

    hasHeadVertex(v: HeadVertex): boolean {
        return this.headVertices.has(v.key)
    }

    hasTailVertex(v: TailVertex): boolean {
        return this.tailVertices.has(v.key)
    }

    includeHead(vertex: HeadVertex) {
        if (!this.headVertices.get(vertex.key)) {
            this.headVertices.set(vertex.key, vertex)
            this.edgesIn.set(vertex.key, [])
        }
    }

    includeTail(vertex: TailVertex) {
        if (!this.tailVertices.get(vertex.key)) {
            this.tailVertices.set(vertex.key, vertex)
            this.edgesOut.set(vertex.key, [])
        }
    }

    inDegree(v: HeadVertex): number {
        return this.edgesIn.get(v.key)?.length ?? 0
    }

    join(tail: TailVertex, head: HeadVertex, attr: EdgeProperties): HeteroEdge<TailVertex, HeadVertex, EdgeProperties> {
        this.includeTail(tail)
        this.includeHead(head)

        const result: HeteroEdge<TailVertex, HeadVertex, EdgeProperties> = {
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

    order() {
        return this.tailVertices.size + this.headVertices.size
    }

    outDegree(v: TailVertex): number {
        return this.edgesOut.get(v.key)?.length ?? 0
    }

    size() {
        return this.edgeCount
    }
}

//=====================================================================================================================
