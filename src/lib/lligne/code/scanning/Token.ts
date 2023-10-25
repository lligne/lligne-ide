//
// # Data types related to Lligne token scanning.
//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {TokenType} from "./TokenType";

//=====================================================================================================================

// Token is a token of type TokenType occurring at sourceOffset with length sourceLength characters in its source code.
export type Token = {
    sourceOffset: number
    sourceLength: number
    tokenType: TokenType
}

//=====================================================================================================================
