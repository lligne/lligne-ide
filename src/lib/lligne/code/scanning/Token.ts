//
// # Data types related to Lligne token scanning.
//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {TokenType} from "./TokenType";

//=====================================================================================================================

/**
 * A token has type TokenType and occurs at sourceOffset with length sourceLength characters in its source code.
 */
export type Token = {
    readonly sourceOffset: number
    readonly sourceLength: number
    readonly tokenType: TokenType
}

//=====================================================================================================================
