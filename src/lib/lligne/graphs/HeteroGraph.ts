//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {type Keyed} from "./Keyed";
import {type Option} from "../util/Option";
import {type HeteroEdge} from "./Edges";

//=====================================================================================================================

/**
 * A directed graph where all vertices are the same type and in and out degrees are unlimited.
 */
export interface HeteroGraph<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties> {

    /**
     * Calls the given call back for each edge coming into the given head vertex.
     * @param callback the function to call with each such edge
     * @return a function that will apply the callback to each incoming edge for a given head vertex
     */
    forEachIncomingEdge(
        callback: (edge: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>) => void
    ): (vertex: HeadVertex) => void

    /**
     * Calls the given call back for each adjacent tail vertex with an edge coming into the given vertex.
     * @param callback the function to call with each such edge
     * @return a function that will apply the callback to each adjacent tail vertex with an edge coming into a given vertex
     */
    forEachInJoinedVertex(
        callback: (vertex: TailVertex) => void
    ): (vertex: HeadVertex) => void

    /**
     * Calls the given call back for each edge going out of the given tail vertex.
     * @param callback the function to call with each such edge
     * @return a function that will apply the callback to each outgoing edge of a given vertex
     */
    forEachOutgoingEdge(
        callback: (edge: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>) => void
    ): (vertex: TailVertex) => void

    /**
     * Calls the given call back for each adjacent vertex joined by an edge going out of the given vertex.
     * @param callback the function to call with each such edge
     * @return a function that will apply the callback to each adjacent head vertex with an edge going out from a given vertex
     */
    forEachOutJoinedVertex(
        callback: (vertex: HeadVertex) => void
    ): (vertex: TailVertex) => void

    /**
     * Tests whether a given edge belongs to this graph.
     * @param edge the edge to check
     */
    hasEdge(edge: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>): boolean

    /**
     * Tests whether a given head vertex belongs to this graph.
     * @param vertex the vertex to check
     */
    hasHeadVertex(vertex: HeadVertex): boolean

    /**
     * Tests whether a given parent vertex belongs to this graph.
     * @param vertex the vertex to check
     */
    hasTailVertex(vertex: TailVertex): boolean

    /**
     * Returns the head vertex with given key (or None).
     * @param key the unique key of a vertex to find
     */
    headVertexWithKey(key: symbol): Option<HeadVertex>

    /**
     * The number of edges coming in to the given head vertex.
     * @param vertex the vertex to query
     */
    inDegree(vertex: HeadVertex): number

    /**
     * The number of vertices in the graph.
     */
    get order(): number

    /**
     * The number of edges going out of the given tail vertex (0 or more).
     * @param vertex the vertex to query
     */
    outDegree(vertex: TailVertex): number

    /**
     * The number of edges in the graph.
     */
    get size(): number

    /**
     * Returns the tail vertex with given key.
     * @param key the unique key of a vertex to find
     */
    tailVertexWithKey(key: symbol): Option<TailVertex>

}

//=====================================================================================================================

