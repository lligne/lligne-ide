//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {describe, expect, it} from "vitest";
import {MutableCompositeTree} from "../../../src/lib/lligne/graphs/impl/MutableCompositeTree";
import {type Keyed} from "../../../src/lib/lligne/graphs/Keyed";

//=====================================================================================================================

type Employee = Keyed & {
    name: string
}

//=====================================================================================================================

type Manager = Employee & {
    bossRating: number
}

//=====================================================================================================================

type EdgeAttrs = {
    since: string
}

//=====================================================================================================================

describe('Composite Tree test', () => {
    it('Behaves as expected', () => {

        const mutTree = new MutableCompositeTree<Manager, Employee, EdgeAttrs>()

        const abbie = {key: Symbol(), name: "Abbie", bossRating:3}
        const baker = {key: Symbol(), name: "Baker"}
        const carla = {key: Symbol(), name: "Carla", bossRating: 4}
        const drake = {key: Symbol(), name: "Drake"}

        const toBaker = mutTree.join(abbie, baker,{since:"2001-01-01"})
        const toCarla = mutTree.join(abbie, carla, {since: "2002-02-02"})
        const toDrake = mutTree.join(carla, drake, {since: "2003-03-03"})

        const tree = mutTree.freeze()

        expect(tree.order).toEqual(4)
        expect(tree.size).toEqual(3)

        expect(tree.hasTailVertex(abbie)).toBeTruthy()
        expect(tree.hasHeadVertex(baker)).toBeTruthy()
        expect(tree.hasTailVertex(carla)).toBeTruthy()
        expect(tree.hasHeadVertex(carla)).toBeTruthy()
        expect(tree.hasHeadVertex(drake)).toBeTruthy()

        expect(tree.hasEdge(toBaker)).toBeTruthy()
        expect(tree.hasEdge(toCarla)).toBeTruthy()
        expect(tree.hasEdge(toDrake)).toBeTruthy()

        expect(toBaker.since).toEqual("2001-01-01")
        expect(toCarla.since).toEqual("2002-02-02")
        expect(toDrake.since).toEqual("2003-03-03")

        expect(toBaker.tail).toBe(abbie)
        expect(toBaker.head).toBe(baker)

        expect(tree.inDegree(abbie)).toEqual(0)
        expect(tree.inDegree(baker)).toEqual(1)
        expect(tree.inDegree(carla)).toEqual(1)
        expect(tree.inDegree(drake)).toEqual(1)

        expect(tree.outDegree(abbie)).toEqual(2)
        expect(tree.outDegree(carla)).toEqual(1)

        tree.forEachIncomingEdge( e => {
            expect(e.tail).toEqual(abbie)
        })(baker)
        tree.forEachIncomingEdge( e => {
            expect(e.tail).toEqual(carla)
        })(drake)

        tree.forEachOutgoingEdge( e => {
            expect(e.head).toEqual(drake)
        })(carla)

        let count = 0
        tree.forEachOutgoingEdge( e => {
            expect([toBaker, toCarla].includes(e)).toBeTruthy()
            count += 1
        })(abbie)
        expect(count).toEqual(2)

        tree.forEachInJoinedVertex( v => {
            expect(v).toEqual(abbie)
        })(baker)
        tree.forEachOutJoinedVertex( v => {
            expect(v).toEqual(drake)
        })(carla)

        count = 0
        tree.forEachOutJoinedVertex( v => {
            expect([baker, carla].includes(v)).toBeTruthy()
            count += 1
        })(abbie)
        expect(count).toEqual(2)

    });

});

//=====================================================================================================================

