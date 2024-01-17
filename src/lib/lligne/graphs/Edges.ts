//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {type Keyed} from "./Keyed";

//=====================================================================================================================

/**
 * The type of edge in a directed graph with head and tail vertices of different types.
 */
export type HeteroEdge<TailVertex, HeadVertex, EdgeProperties> =
    Keyed &
    EdgeProperties &
    {
        readonly tail: TailVertex,
        readonly head: HeadVertex
    }

//=====================================================================================================================

/**
 * The type of edge in a directed graph with vertices all the same type.
 */
export type Edge<Vertex, EdgeProperties> = HeteroEdge<Vertex, Vertex, EdgeProperties>

//=====================================================================================================================

/**
 * Tests whether an edge is a self loop.
 * @param edge the edge to check.
 */
export function isSelfLoop<Vertex, EdgeProperties>(edge: Edge<Vertex, EdgeProperties>): boolean {
    return edge.tail === edge.head
}

//=====================================================================================================================


