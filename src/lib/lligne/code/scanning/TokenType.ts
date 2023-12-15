//
// # Data types related to Lligne token scanning.
//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

//=====================================================================================================================

// TokenType is an enumeration of Lligne token types.
export type TokenType =
    | '#TokenTypeEof'

    // Punctuation
    | '#TokenTypeAmpersand'
    | '#TokenTypeAmpersandAmpersand'
    | '#TokenTypeAsterisk'
    | '#TokenTypeAtSign'
    | '#TokenTypeColon'
    | '#TokenTypeComma'
    | '#TokenTypeDash'
    | '#TokenTypeDot'
    | '#TokenTypeDotDot'
    | '#TokenTypeDotDotDot'
    | '#TokenTypeEquals'
    | '#TokenTypeEqualsEquals'
    | '#TokenTypeEqualsEqualsEquals'
    | '#TokenTypeEqualsTilde'
    | '#TokenTypeExclamation'
    | '#TokenTypeExclamationEquals'
    | '#TokenTypeExclamationTilde'
    | '#TokenTypeGreaterThan'
    | '#TokenTypeGreaterThanOrEquals'
    | '#TokenTypeHash'
    | '#TokenTypeLeftBrace'
    | '#TokenTypeLeftBracket'
    | '#TokenTypeLeftParenthesis'
    | '#TokenTypeLessThan'
    | '#TokenTypeLessThanOrEquals'
    | '#TokenTypePlus'
    | '#TokenTypeQuestion'
    | '#TokenTypeQuestionColon'
    | '#TokenTypeRightArrow'
    | '#TokenTypeRightBrace'
    | '#TokenTypeRightBracket'
    | '#TokenTypeRightParenthesis'
    | '#TokenTypeSemicolon'
    | '#TokenTypeSlash'
    | '#TokenTypeVerticalBar'

    // Keywords
    | '#TokenTypeAnd'
    | '#TokenTypeAs'
    | '#TokenTypeBoolean'
    | '#TokenTypeFalse'
    | '#TokenTypeFloat64'
    | '#TokenTypeIn'
    | '#TokenTypeInt64'
    | '#TokenTypeIs'
    | '#TokenTypeNot'
    | '#TokenTypeOr'
    | '#TokenTypeString'
    | '#TokenTypeTrue'
    | '#TokenTypeWhen'
    | '#TokenTypeWhere'

    // Others
    | '#TokenTypeBackTickedString'
    | '#TokenTypeDocumentation'
    | '#TokenTypeDoubleQuotedString'
    | '#TokenTypeFloatingPointLiteral'
    | '#TokenTypeIdentifier'
    | '#TokenTypeIntegerLiteral'
    | '#TokenTypeSingleQuotedString'

    // Errors
    | '#TokenTypeUnclosedDoubleQuotedString'
    | '#TokenTypeUnclosedSingleQuotedString'
    | '#TokenTypeUnrecognizedChar'

    // Synthetic token types from postprocessing
    | '#TokenTypeLeadingDocumentation'
    | '#TokenTypeSynthDocument'
    | '#TokenTypeTrailingDocumentation'

    ;

// ---------------------------------------------------------------------------------------------------------------------

// TextOfTokenType returns a string describing a Lligne token type.
export function textOfTokenType(tt: TokenType): string {

    switch (tt) {

        case '#TokenTypeEof':
            return "[end of file]"

        // Punctuation
        case '#TokenTypeAmpersand':
            return "&"
        case '#TokenTypeAmpersandAmpersand':
            return "&&"
        case '#TokenTypeAsterisk':
            return "*"
        case '#TokenTypeAtSign':
            return "@"
        case '#TokenTypeColon':
            return ":"
        case '#TokenTypeComma':
            return ","
        case '#TokenTypeDash':
            return "-"
        case '#TokenTypeDot':
            return "."
        case '#TokenTypeDotDot':
            return ".."
        case '#TokenTypeDotDotDot':
            return "..."
        case '#TokenTypeEquals':
            return "="
        case '#TokenTypeEqualsEquals':
            return "=="
        case '#TokenTypeEqualsEqualsEquals':
            return "==="
        case '#TokenTypeEqualsTilde':
            return "=~"
        case '#TokenTypeExclamation':
            return "!"
        case '#TokenTypeExclamationEquals':
            return "!="
        case '#TokenTypeExclamationTilde':
            return "!~"
        case '#TokenTypeGreaterThan':
            return ">"
        case '#TokenTypeGreaterThanOrEquals':
            return ">="
        case '#TokenTypeHash':
            return "#"
        case '#TokenTypeLeftBrace':
            return "{"
        case '#TokenTypeLeftBracket':
            return "["
        case '#TokenTypeLeftParenthesis':
            return "("
        case '#TokenTypeLessThan':
            return "<"
        case '#TokenTypeLessThanOrEquals':
            return "<="
        case '#TokenTypePlus':
            return "+"
        case '#TokenTypeQuestion':
            return "?"
        case '#TokenTypeQuestionColon':
            return "?:"
        case '#TokenTypeRightArrow':
            return "->"
        case '#TokenTypeRightBrace':
            return "}"
        case '#TokenTypeRightBracket':
            return "]"
        case '#TokenTypeRightParenthesis':
            return ")"
        case '#TokenTypeSemicolon':
            return ";"
        case '#TokenTypeSlash':
            return "/"
        case '#TokenTypeVerticalBar':
            return "|"

        // Keywords
        case '#TokenTypeAnd':
            return "and"
        case '#TokenTypeAs':
            return "as"
        case '#TokenTypeBoolean':
            return "Boolean"
        case '#TokenTypeFalse':
            return "false"
        case '#TokenTypeFloat64':
            return "Float64"
        case '#TokenTypeIn':
            return "in"
        case '#TokenTypeInt64':
            return "Int64"
        case '#TokenTypeIs':
            return "is"
        case '#TokenTypeNot':
            return "not"
        case '#TokenTypeOr':
            return "or"
        case '#TokenTypeString':
            return "String"
        case '#TokenTypeTrue':
            return "true"
        case '#TokenTypeWhen':
            return "when"
        case '#TokenTypeWhere':
            return "where"

        // Others
        case '#TokenTypeBackTickedString':
            return "[back-ticked string]"
        case '#TokenTypeDocumentation':
            return "[documentation]"
        case '#TokenTypeDoubleQuotedString':
            return "[string literal]"
        case '#TokenTypeFloatingPointLiteral':
            return "[floating point literal]"
        case '#TokenTypeIdentifier':
            return "[identifier]"
        case '#TokenTypeIntegerLiteral':
            return "[integer literal]"
        case '#TokenTypeSingleQuotedString':
            return "[character literal]"

        // Documentation
        case '#TokenTypeLeadingDocumentation':
            return "[leading documentation]"
        case '#TokenTypeSynthDocument':
            return "[synthetic documentation operator]"
        case '#TokenTypeTrailingDocumentation':
            return "[trailing documentation]"

        // Errors
        case '#TokenTypeUnclosedSingleQuotedString':
            return "[error - literal extends past end of line]"
        case '#TokenTypeUnclosedDoubleQuotedString':
            return "[error - string extends past end of line]"
        case '#TokenTypeUnrecognizedChar':
            return "[error - unrecognized character]"

    }
}

//=====================================================================================================================
