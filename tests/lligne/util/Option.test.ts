import {describe, it, expect} from 'vitest';
import {
    areEqual,
    filter,
    isNone,
    isSome,
    map,
    match,
    none,
    some,
    toArray,
    value
} from "../../../src/lib/lligne/util/Option";


describe('Option test', () => {
    it('initializes None', () => {
        const nuttin = none();

        expect(isNone(nuttin)).toBeTruthy();
        expect(isSome(nuttin)).toBeFalsy();
        expect(areEqual(nuttin, none())).toBeTruthy();
        expect(isNone(map(nuttin, (x: number) => {
            return x + 42;
        }))).toBeTruthy();
        expect(isNone(filter(nuttin, (v: number) => {
            return v == 42
        }))).toBeTruthy()
        expect(match(nuttin, {
            ifNone: () => true,
            ifSome: (x: number) => x == -42 && x > 0
        })).toBeTruthy();
        expect(toArray(nuttin)).toEqual([]);
        expect(value(nuttin, 101)).toEqual(101);
    });

    it('initializes Some', () => {
        const sumptin = some("stuff");

        expect(isNone(sumptin)).toBeFalsy();

        expect(isSome(sumptin)).toBeTruthy();

        expect(areEqual(sumptin, none())).toBeFalsy();
        expect(areEqual(sumptin, some("junk"))).toBeFalsy();
        expect(areEqual(sumptin, some("stuff"))).toBeTruthy();

        expect(map(sumptin, (x: string) => {
            return "e-" + x;
        })).toEqual(some("e-stuff"))

        expect(isNone(filter(sumptin, (v: string) => {
            return v == "junk"
        }))).toBeTruthy()

        expect(filter(sumptin, (v: string) => {
            return v == "stuff"
        })).toEqual(some("stuff"))
        expect(filter(sumptin, (v: string) => {
            return v == "junk"
        })).toEqual(none())

        expect(match(sumptin, {
            ifNone: () => false,
            ifSome: (x: string) => x == "stuff"
        })).toBeTruthy();
        expect(match(sumptin, {
            ifNone: () => false,
            ifSome: (x: string) => x == "junk"
        })).toBeFalsy();

        expect(toArray(sumptin)).toEqual(["stuff"]);

        expect(value(sumptin, "fluff")).toEqual("stuff");
    });
});
