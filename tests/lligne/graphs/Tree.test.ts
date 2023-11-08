import {describe, expect, it} from "vitest";
import {type Keyed} from "../../../src/lib/lligne/graphs/Keyed";
import {MutableTree} from "../../../src/lib/lligne/graphs/Tree";


type Employee = Keyed & {
    name: string
}

type EdgeAttrs = {
    since: string
}

describe('Tree test', () => {
    it('Behaves as expected', () => {

        const mutTree = new MutableTree<Employee, EdgeAttrs>()

        const abbie = mutTree.include({key: Symbol(), name: "Abbie"})

        const toBaker = mutTree.join(abbie, {key: Symbol(), name: "Baker"}, {since:"2001-01-01"})
        const baker = toBaker.head
        const toCarla = mutTree.join(abbie, {key: Symbol(), name: "Carla"}, {since: "2002-02-02"})
        const carla = toCarla.head
        const toDrake = mutTree.join(carla, {key: Symbol(), name: "Drake"}, {since: "2003-03-03"})
        const drake = toDrake.head

        const tree = mutTree.freeze()

        expect(tree.order).toEqual(4)
        expect(tree.size).toEqual(3)

        expect(tree.hasVertex(abbie)).toBeTruthy()
        expect(tree.hasVertex(baker)).toBeTruthy()
        expect(tree.hasVertex(carla)).toBeTruthy()
        expect(tree.hasVertex(drake)).toBeTruthy()

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
        expect(tree.outDegree(baker)).toEqual(0)
        expect(tree.outDegree(carla)).toEqual(1)
        expect(tree.outDegree(drake)).toEqual(0)

        tree.forEachIncomingEdge(abbie, _ => {
            throw Error("Should have no incoming edges")
        })
        tree.forEachIncomingEdge(baker, e => {
            expect(e.tail).toEqual(abbie)
        })
        tree.forEachOutgoingEdge(baker, e => {
            expect(e.head).toEqual(drake)
        })

        let count = 0
        tree.forEachOutgoingEdge(abbie, e => {
            expect([toBaker, toCarla].includes(e)).toBeTruthy()
            count += 1
        })
        expect(count).toEqual(2)

        tree.forEachInJoinedVertex(baker, v => {
            expect(v).toEqual(abbie)
        })
        tree.forEachOutJoinedVertex(baker, v => {
            expect(v).toEqual(drake)
        })

        count = 0
        tree.forEachOutJoinedVertex(abbie, v => {
            expect([baker, carla].includes(v)).toBeTruthy()
            count += 1
        })
        expect(count).toEqual(2)

    });

});