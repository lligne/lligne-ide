import {describe, it, expect} from 'vitest';
import {
    areEqual,
    isNone,
    isSome,
    map,
    match,
    none,
    some,
    toArray,
    value
} from "../../../../src/lib/lligne/code/util/Option";


describe('Option test', () => {
    it('initializes None', () => {
        const nuttin = none();

        expect(isNone(nuttin)).toBeTruthy();
        expect(isSome(nuttin)).toBeFalsy();
        expect(areEqual(nuttin, none())).toBeTruthy();
        expect(isNone(map(nuttin, (x: number) => {
            return 42;
        }))).toBeTruthy();
        expect(match(nuttin, {
            ifNone: () => true,
            ifSome: (x: number) => false
        })).toBeTruthy();
        expect(toArray(nuttin)).toEqual([]);
        expect(value(nuttin, 101)).toEqual(101);
    });

    it('initializes Some', () => {
        const sumptin = some("stuff");

        expect(isNone(sumptin)).toBeFalsy();
        expect(isSome(sumptin)).toBeTruthy();
        expect(areEqual(sumptin, none())).toBeFalsy();
        expect(areEqual(sumptin, some("stuff"))).toBeTruthy();
        expect(isSome(map(sumptin, (x: string) => {
            return 42;
        }))).toBeTruthy();
        expect(match(sumptin, {
            ifNone: () => false,
            ifSome: (x: string) => true
        })).toBeTruthy();
        expect(toArray(sumptin)).toEqual(["stuff"]);
        expect(value(sumptin, "fluff")).toEqual("stuff");
    });
});
