//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

//=====================================================================================================================

export type None = {
    readonly tag: 'Option#None'
}

export type Some<T> = {
    readonly tag: 'Option#Some',
    readonly value: T
}

//=====================================================================================================================

export type Option<T> =
    | None
    | Some<T>
    ;

export function areEqual<T>(option1: Option<T>, option2: Option<T>): boolean {
    switch (option1.tag) {
        case 'Option#None':
            return option2.tag == 'Option#None';
        case 'Option#Some':
            return option2.tag == 'Option#Some' && option1.value == option2.value;
    }
}

// TBD: compare (compares values, with None < Some(v))

export function filter<T>(option: Option<T>, predicate: (value: T) => boolean): Option<T> {
    if (option.tag == 'Option#Some' && predicate(option.value)) {
        return option
    } else {
        return none()
    }
}

export function isNone<T>(option: Option<T>): boolean {
    switch (option.tag) {
        case 'Option#None':
            return true
        case 'Option#Some':
            return false
    }
}

export function isSome<T>(option: Option<T>): boolean {
    switch (option.tag) {
        case 'Option#None':
            return false
        case 'Option#Some':
            return true
    }
}

export function map<T, U>(option: Option<T>, mapFn: (value: T) => U): Option<U> {
    switch (option.tag) {
        case 'Option#None':
            return none()
        case 'Option#Some':
            return some(mapFn(option.value))
    }
}

export function match<T, U>(option: Option<T>, dispatch: { ifNone: () => U, ifSome: (value: T) => U }) {
    switch (option.tag) {
        case 'Option#None':
            return dispatch.ifNone()
        case 'Option#Some':
            return dispatch.ifSome(option.value)
    }
}

export function none(): None {
    return {tag: 'Option#None'}
}

export function some<T>(value: T): Some<T> {
    return {tag: 'Option#Some', value}
}

export function toArray<T>(option: Option<T>): T[] {
    switch (option.tag) {
        case 'Option#None':
            return []
        case 'Option#Some':
            return [option.value]
    }
}

// TBD: toResult (value or error)

export function value<T>(option: Option<T>, defawlt: T): T {
    switch (option.tag) {
        case 'Option#None':
            return defawlt
        case 'Option#Some':
            return option.value
    }
}

//=====================================================================================================================
