//
// # Data types related to Lligne token scanning.
//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

//=====================================================================================================================

// TokenType is an enumeration of Lligne token types.
export type TokenType =
    | 'TokenType#Eof'

    // Punctuation
    | 'TokenType#Ampersand'
    | 'TokenType#AmpersandAmpersand'
    | 'TokenType#Asterisk'
    | 'TokenType#Colon'
    | 'TokenType#Comma'
    | 'TokenType#Dash'
    | 'TokenType#Dot'
    | 'TokenType#DotDot'
    | 'TokenType#DotDotDot'
    | 'TokenType#Equals'
    | 'TokenType#EqualsEquals'
    | 'TokenType#EqualsEqualsEquals'
    | 'TokenType#EqualsTilde'
    | 'TokenType#Exclamation'
    | 'TokenType#ExclamationEquals'
    | 'TokenType#ExclamationTilde'
    | 'TokenType#GreaterThan'
    | 'TokenType#GreaterThanOrEquals'
    | 'TokenType#LeftBrace'
    | 'TokenType#LeftBracket'
    | 'TokenType#LeftParenthesis'
    | 'TokenType#LessThan'
    | 'TokenType#LessThanOrEquals'
    | 'TokenType#Plus'
    | 'TokenType#Question'
    | 'TokenType#QuestionColon'
    | 'TokenType#RightArrow'
    | 'TokenType#RightBrace'
    | 'TokenType#RightBracket'
    | 'TokenType#RightParenthesis'
    | 'TokenType#Semicolon'
    | 'TokenType#Slash'
    | 'TokenType#VerticalBar'

    // Keywords
    | 'TokenType#And'
    | 'TokenType#As'
    | 'TokenType#Boolean'
    | 'TokenType#False'
    | 'TokenType#Float64'
    | 'TokenType#In'
    | 'TokenType#Int64'
    | 'TokenType#Is'
    | 'TokenType#Not'
    | 'TokenType#Or'
    | 'TokenType#String'
    | 'TokenType#True'
    | 'TokenType#When'
    | 'TokenType#Where'

    // Others
    | 'TokenType#BackTickedString'
    | 'TokenType#Documentation'
    | 'TokenType#DoubleQuotedString'
    | 'TokenType#FloatingPointLiteral'
    | 'TokenType#Identifier'
    | 'TokenType#IntegerLiteral'
    | 'TokenType#SingleQuotedString'

    // Errors
    | 'TokenType#UnclosedDoubleQuotedString'
    | 'TokenType#UnclosedSingleQuotedString'
    | 'TokenType#UnrecognizedChar'

    // Synthetic token types from postprocessing
    | 'TokenType#LeadingDocumentation'
    | 'TokenType#SynthDocument'
    | 'TokenType#TrailingDocumentation'

    ;

// ---------------------------------------------------------------------------------------------------------------------

// TextOfTokenType returns a string describing a Lligne token type.
export function textOfTokenType(tt: TokenType): string {

    switch (tt) {

        case 'TokenType#Eof':
            return "[end of file]"

        // Punctuation
        case 'TokenType#Ampersand':
            return "&"
        case 'TokenType#AmpersandAmpersand':
            return "&&"
        case 'TokenType#Asterisk':
            return "*"
        case 'TokenType#Colon':
            return ":"
        case 'TokenType#Comma':
            return ","
        case 'TokenType#Dash':
            return "-"
        case 'TokenType#Dot':
            return "."
        case 'TokenType#DotDot':
            return ".."
        case 'TokenType#DotDotDot':
            return "..."
        case 'TokenType#Equals':
            return "="
        case 'TokenType#EqualsEquals':
            return "=="
        case 'TokenType#EqualsEqualsEquals':
            return "==="
        case 'TokenType#EqualsTilde':
            return "=~"
        case 'TokenType#Exclamation':
            return "!"
        case 'TokenType#ExclamationEquals':
            return "!="
        case 'TokenType#ExclamationTilde':
            return "!~"
        case 'TokenType#GreaterThan':
            return ">"
        case 'TokenType#GreaterThanOrEquals':
            return ">="
        case 'TokenType#LeftBrace':
            return "{"
        case 'TokenType#LeftBracket':
            return "["
        case 'TokenType#LeftParenthesis':
            return "("
        case 'TokenType#LessThan':
            return "<"
        case 'TokenType#LessThanOrEquals':
            return "<="
        case 'TokenType#Plus':
            return "+"
        case 'TokenType#Question':
            return "?"
        case 'TokenType#QuestionColon':
            return "?:"
        case 'TokenType#RightArrow':
            return "->"
        case 'TokenType#RightBrace':
            return "}"
        case 'TokenType#RightBracket':
            return "]"
        case 'TokenType#RightParenthesis':
            return ")"
        case 'TokenType#Semicolon':
            return ";"
        case 'TokenType#Slash':
            return "/"
        case 'TokenType#VerticalBar':
            return "|"

        // Keywords
        case 'TokenType#And':
            return "and"
        case 'TokenType#As':
            return "as"
        case 'TokenType#Boolean':
            return "Boolean"
        case 'TokenType#False':
            return "false"
        case 'TokenType#Float64':
            return "Float64"
        case 'TokenType#In':
            return "in"
        case 'TokenType#Int64':
            return "Int64"
        case 'TokenType#Is':
            return "is"
        case 'TokenType#Not':
            return "not"
        case 'TokenType#Or':
            return "or"
        case 'TokenType#String':
            return "String"
        case 'TokenType#True':
            return "true"
        case 'TokenType#When':
            return "when"
        case 'TokenType#Where':
            return "where"

        // Others
        case 'TokenType#BackTickedString':
            return "[back-ticked string]"
        case 'TokenType#Documentation':
            return "[documentation]"
        case 'TokenType#DoubleQuotedString':
            return "[string literal]"
        case 'TokenType#FloatingPointLiteral':
            return "[floating point literal]"
        case 'TokenType#Identifier':
            return "[identifier]"
        case 'TokenType#IntegerLiteral':
            return "[integer literal]"
        case 'TokenType#SingleQuotedString':
            return "[character literal]"

        // Documentation
        case 'TokenType#LeadingDocumentation':
            return "[leading documentation]"
        case 'TokenType#SynthDocument':
            return "[synthetic documentation operator]"
        case 'TokenType#TrailingDocumentation':
            return "[trailing documentation]"

        // Errors
        case 'TokenType#UnclosedSingleQuotedString':
            return "[error - literal extends past end of line]"
        case 'TokenType#UnclosedDoubleQuotedString':
            return "[error - string extends past end of line]"
        case 'TokenType#UnrecognizedChar':
            return "[error - unrecognized character]"

    }
}

//=====================================================================================================================
