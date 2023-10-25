//
// # Lligne token type constants.
//
// Note: We use u16 instead of an enum because we want space efficient 64-bit tokens
// (by the thousands), and the enumeration is rarely used in an exhaustive way anyway.
//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

//=====================================================================================================================

// End of File
pub const EOF: u16 = 0;

// Punctuation
pub const AMPERSAND: u16 = 1;
pub const AMPERSAND_AMPERSAND: u16 = 2;
pub const ASTERISK: u16 = 3;
pub const COLON: u16 = 4;
pub const COMMA: u16 = 5;
pub const DASH: u16 = 6;
pub const DOT: u16 = 7;
pub const DOT_DOT: u16 = 8;
pub const DOT_DOT_DOT: u16 = 9;
pub const EQUALS: u16 = 10;
pub const EQUALS_EQUALS: u16 = 11;
pub const EQUALS_EQUALS_EQUALS: u16 = 12;
pub const EQUALS_TILDE: u16 = 13;
pub const EXCLAMATION: u16 = 14;
pub const EXCLAMATION_EQUALS: u16 = 15;
pub const EXCLAMATION_TILDE: u16 = 16;
pub const GREATER_THAN: u16 = 17;
pub const GREATER_THAN_OR_EQUALS: u16 = 18;
pub const LEFT_BRACE: u16 = 19;
pub const LEFT_BRACKET: u16 = 20;
pub const LEFT_PARENTHESIS: u16 = 21;
pub const LESS_THAN: u16 = 22;
pub const LESS_THAN_OR_EQUALS: u16 = 23;
pub const PLUS: u16 = 24;
pub const QUESTION: u16 = 25;
pub const QUESTION_COLON: u16 = 26;
pub const RIGHT_ARROW: u16 = 27;
pub const RIGHT_BRACE: u16 = 28;
pub const RIGHT_BRACKET: u16 = 29;
pub const RIGHT_PARENTHESIS: u16 = 30;
pub const SEMICOLON: u16 = 31;
pub const SLASH: u16 = 32;
pub const VERTICAL_BAR: u16 = 33;

// Keywords
pub const AND: u16 = 34;
pub const AS: u16 = 35;
pub const FALSE: u16 = 36;
pub const IN: u16 = 37;
pub const IS: u16 = 38;
pub const NOT: u16 = 39;
pub const OR: u16 = 40;
pub const TRUE: u16 = 41;
pub const WHEN: u16 = 42;
pub const WHERE: u16 = 43;

// Literals
pub const BACK_TICKED_STRING: u16 = 44;
pub const BUILT_IN_TYPE: u16 = 45;
pub const DOCUMENTATION: u16 = 46;
pub const DOUBLE_QUOTED_STRING: u16 = 47;
pub const FLOATING_POINT_LITERAL: u16 = 48;
pub const INTEGER_LITERAL: u16 = 49;
pub const SINGLE_QUOTED_STRING: u16 = 50;

// Identifiers
pub const IDENTIFIER: u16 = 51;

// Errors
pub const UNCLOSED_DOUBLE_QUOTED_STRING: u16 = 52;
pub const UNCLOSED_SINGLE_QUOTED_STRING: u16 = 53;
pub const UNRECOGNIZED_CHAR: u16 = 54;

// Synthetic token types from postprocessing
pub const LEADING_DOCUMENTATION: u16 = 55;
pub const SYNTH_DOCUMENT: u16 = 56;
pub const TRAILING_DOCUMENTATION: u16 = 57;

pub const COUNT: u16 = 58;

// ---------------------------------------------------------------------------------------------------------------------

pub fn text_of_token_type(token_type: u16) -> &'static str {
    return match token_type {
        EOF => "[end of file]",

        // Punctuation
        AMPERSAND => "&",
        AMPERSAND_AMPERSAND => "&&",
        ASTERISK => "*",
        COLON => ":",
        COMMA => ",",
        DASH => "-",
        DOT => ".",
        DOT_DOT => "..",
        DOT_DOT_DOT => "...",
        EQUALS => "=",
        EQUALS_EQUALS => "==",
        EQUALS_EQUALS_EQUALS => "===",
        EQUALS_TILDE => "=~",
        EXCLAMATION => "!",
        EXCLAMATION_EQUALS => "!=",
        EXCLAMATION_TILDE => "!~",
        GREATER_THAN => ">",
        GREATER_THAN_OR_EQUALS => ">=",
        LEFT_BRACE => "{",
        LEFT_BRACKET => "[",
        LEFT_PARENTHESIS => "(",
        LESS_THAN => "<",
        LESS_THAN_OR_EQUALS => "<=",
        PLUS => "+",
        QUESTION => "?",
        QUESTION_COLON => "?:",
        RIGHT_ARROW => "->",
        RIGHT_BRACE => "}",
        RIGHT_BRACKET => "]",
        RIGHT_PARENTHESIS => ")",
        SEMICOLON => ";",
        SLASH => "/",
        VERTICAL_BAR => "|",

        // Keywords
        AND => "and",
        AS => "as",
        FALSE => "false",
        IN => "in",
        IS => "is",
        NOT => "not",
        OR => "or",
        TRUE => "true",
        WHEN => "when",
        WHERE => "where",

        // Literals
        BACK_TICKED_STRING => "[back-ticked string]",
        BUILT_IN_TYPE => "[built in type]",
        DOCUMENTATION => "[documentation]",
        DOUBLE_QUOTED_STRING => "[string literal]",
        FLOATING_POINT_LITERAL => "[floating point literal]",
        INTEGER_LITERAL => "[integer literal]",
        SINGLE_QUOTED_STRING => "[character literal]",

        // Identifiers
        IDENTIFIER => "[identifier]",

        // Errors
        UNCLOSED_DOUBLE_QUOTED_STRING => "[error - string extends past end of line]",
        UNCLOSED_SINGLE_QUOTED_STRING => "[error - literal extends past end of line]",
        UNRECOGNIZED_CHAR => "[error - unrecognized character]",

        // Synthetic token types from postprocessing
        LEADING_DOCUMENTATION => "[leading documentation]",
        SYNTH_DOCUMENT => "[synthetic documentation operator]",
        TRAILING_DOCUMENTATION => "[trailing documentation]",

        _ => panic!("Missing token text entry")
    };
}

//=====================================================================================================================
