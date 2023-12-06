//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {type Keyed} from "./Keyed";

//=====================================================================================================================

/**
 * The type of edge in a directed graph with vertices all the same type.
 */
export type HomogeneousEdge<Vertex, EdgeProperties> =
    Keyed & EdgeProperties & {
    readonly tail: Vertex,
    readonly head: Vertex
}

//=====================================================================================================================

/**
 * The type of edge in a directed graph with head and tail vertices of different types.
 */
export type HeterogeneousEdge<TailVertex, HeadVertex, EdgeProperties> =
    Keyed & EdgeProperties & {
    readonly tail: TailVertex,
    readonly head: HeadVertex
}

//=====================================================================================================================
