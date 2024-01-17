//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {type Keyed} from "../Keyed"
import {type CompositeTree} from "../CompositeTree";
import {MutableHeteroGraph1toN} from "./MutableHeteroGraph1toN";
import {type Option} from "../../util/Option";
import {type HeteroEdge} from "../Edges";

//=====================================================================================================================

/**
 * Mutable implementation of CompositeTree.
 */
export class MutableCompositeTree<ParentVertex extends ChildVertex, ChildVertex extends Keyed, EdgeProperties>
    implements CompositeTree<ParentVertex, ChildVertex, EdgeProperties> {

    private graph: MutableHeteroGraph1toN<ParentVertex, ChildVertex, EdgeProperties>

    constructor() {
        this.graph = new MutableHeteroGraph1toN<ParentVertex, ChildVertex, EdgeProperties>()
    }

    forEachIncomingEdge(
        callback: (edge: HeteroEdge<ParentVertex, ChildVertex, EdgeProperties>) => void
    ) {
        return this.graph.forEachIncomingEdge(callback)
    }

    forEachInJoinedVertex(
        callback: (vertex: ParentVertex) => void
    ) {
        return this.graph.forEachInJoinedVertex(callback)
    }

    forEachOutgoingEdge(
        callback: (edge: HeteroEdge<ParentVertex, ChildVertex, EdgeProperties>) => void
    ) {
        return this.graph.forEachOutgoingEdge(callback)
    }

    forEachOutJoinedVertex(
        callback: (vertex: ChildVertex) => void
    ) {
        return this.graph.forEachOutJoinedVertex(callback)
    }

    /**
     * Freezes the underlying graph implementation to prevent further mutation.
     */
    freeze(): CompositeTree<ParentVertex, ChildVertex, EdgeProperties> {
        return this.graph.freeze()
    }

    hasEdge(edge: HeteroEdge<ParentVertex, ChildVertex, EdgeProperties>): boolean {
        return this.graph.hasEdge(edge)
    }

    hasHeadVertex(vertex: ChildVertex): boolean {
        return this.graph.hasHeadVertex(vertex)
    }

    hasTailVertex(vertex: ParentVertex): boolean {
        return this.graph.hasTailVertex(vertex)
    }

    headVertexWithKey(key: symbol): Option<ChildVertex> {
        return this.graph.headVertexWithKey(key)
    }

    inDegree(vertex: ChildVertex): number {
        return this.graph.inDegree(vertex)
    }

    /**
     * Adds an edge to this graph from tail to head.
     * @param tail the vertex at the tail of the new edge
     * @param head the vertex at the head of the new edge
     * @param edgeProperties the additional properties of the new edge
     */
    join(
        tail: ParentVertex,
        head: ChildVertex,
        edgeProperties: EdgeProperties
    ): HeteroEdge<ParentVertex, ChildVertex, EdgeProperties> {
        return this.graph.join(tail, head, edgeProperties)
    }

    get order(): number {
        return this.graph.order
    }

    outDegree(vertex: ParentVertex): number {
        return this.graph.outDegree(vertex)
    }

    get size(): number {
        return this.graph.size
    }

    tailVertexWithKey(key: symbol): Option<ParentVertex> {
        return this.graph.tailVertexWithKey(key)
    }

}

//=====================================================================================================================

