//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {type Keyed} from "./Keyed";
import {type Edge} from "./Edges";

//=====================================================================================================================

// TODO: Refactor to match HeteroGraph

/**
 * A directed graph where all vertices are the same type and in and out degrees are unlimited.
 */
export interface GraphNtoN<Vertex extends Keyed, EdgeProperties> {

    forEachIncomingEdge(vertex: Vertex, callback: (edge: Edge<Vertex, EdgeProperties>) => void): void

    forEachInJoinedVertex(vertex: Vertex, callback: (vertex: Vertex) => void): void

    forEachOutgoingEdge(vertex: Vertex, callback: (edge: Edge<Vertex, EdgeProperties>) => void): void

    hasEdge(edge: Edge<Vertex, EdgeProperties>): boolean

    hasVertex(v: Vertex): boolean

    include(vertex: Vertex): GraphNtoN<Vertex, EdgeProperties>

    inDegree(v: Vertex): number

    join(tail: Vertex, head: Vertex, attr: EdgeProperties): Edge<Vertex, EdgeProperties>

    order(): number

    outDegree(v: Vertex): number

    size(): number

}

//=====================================================================================================================

