//
// (C) Copyright 2023-2024 Martin E. Nordberg III
// Apache 2.0 License
//

import {type Keyed} from "./Keyed";
import {type Option} from "../util/Option";
import {type HeteroEdge} from "./Edges";
import {type Observer, Subscription} from "rxjs";

//=====================================================================================================================

export interface FilterableHeadVertexTraversal<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties> {

    and(): HeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    or(): HeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    subscribe(observer: Partial<Observer<HeadVertex>> | ((value: HeadVertex) => void)): Subscription

}

//=====================================================================================================================

export interface FilterableHeteroEdgeTraversal<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties> {

    and(): HeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    or(): HeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    subscribe(observer: Partial<Observer<HeteroEdge<TailVertex, HeadVertex, EdgeProperties>>> |
        ((value: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>) => void)): Subscription

}

//=====================================================================================================================

export interface FilterableTailVertexTraversal<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties> {

    and(): TailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    or(): TailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    subscribe(observer: Partial<Observer<TailVertex>> | ((value: TailVertex) => void)): Subscription

}

//=====================================================================================================================

export interface HeadVertexTraversal<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties>
    extends FilterableHeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties> {

    joinedFromVertex(
        vertex: TailVertex
    ): FilterableHeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    joinedFromVertexWithKey(
        key: symbol
    ): FilterableHeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    matching(
        predicate: (vertex: HeadVertex) => boolean
    ): FilterableHeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    withKey(
        key: symbol
    ): FilterableHeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    withIncomingEdgeMatching(
        predicate: (edge: EdgeProperties) => boolean
    ): FilterableHeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

}

//=====================================================================================================================

export interface HeteroEdgeTraversal<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties>
    extends FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties> {

    connecting(
        tailVertex: TailVertex,
        headVertex: HeadVertex
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    intoVertex(
        vertex: HeadVertex
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    intoVertexWithKey(
        key: symbol
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    intoVerticesMatching(
        predicate: (vertex: HeadVertex) => boolean
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    matching(
        predicate: (edge: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>) => boolean
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    outFromVertex(
        vertex: TailVertex
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    outFromVertexWithKey(
        key: symbol
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    outFromVerticesMatching(
        predicate: (vertex: TailVertex) => boolean
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    withKey(
        key: symbol
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

}

//=====================================================================================================================

export interface TailVertexTraversal<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties>
    extends FilterableTailVertexTraversal<TailVertex, HeadVertex, EdgeProperties> {

    joinedToVertex(
        vertex: HeadVertex
    ): FilterableTailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    joinedToVertexWithKey(
        key: symbol
    ): FilterableTailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    matching(
        predicate: (vertex: TailVertex) => boolean
    ): FilterableTailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    withKey(
        key: symbol
    ): FilterableTailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    withOutgoingEdgeMatching(
        predicate: (edge: EdgeProperties) => boolean
    ): FilterableTailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

}

//=====================================================================================================================

/**
 * A directed graph where tail and head vertices are different types.
 */
export interface HeteroGraph<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties> {

    /**
     * Begins an algorithm to be applied to a subsequently specified set of edges within the graph.
     *
     * @example
     *  graph.forEachEdge()
     *       .outFromVertex(myVertex)
     *       .subscribe(v => console.log(v.name))
     */
    forEachEdge(): HeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    /**
     * Begins an algorithm to be applied to a subsequently specified set of head vertices within the graph.
     *
     * @example
     *  graph.forEachHeadVertex()
     *       .matching(v => v.tag == '#MyTag')
     *       .subscribe( v => {
     *           // stuff
     *       })
     */
    forEachHeadVertex(): HeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

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
     * Begins an algorithm to be applied to a subsequently specified set of tail vertices within the graph.
     */
    forEachTailVertex(): TailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

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

