//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {SourcePos} from "../../util/SourcePos"
import type {Keyed} from "../../../graphs/Keyed"

//=====================================================================================================================

/**
 * A record field's structure.
 */
export type RecordField = Keyed & {
    readonly tag: '#RecordField',
    readonly sourcePos: SourcePos,
    readonly value: boolean
}

//=====================================================================================================================

