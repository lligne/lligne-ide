//
// # Scanner for Lligne tokens.
//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

//=====================================================================================================================

use std::collections::{HashMap, HashSet};
use std::str::Chars;
use cached::proc_macro::once;
use shared_vector::Vector;
use shared_vector::SharedVector;
use crate::lligne::code::scanning::token_types;
use crate::lligne::code::scanning::token_types::text_of_token_type;
use crate::lligne::code::scanning::tokens::Token;

pub struct Outcome<'a> {
    pub source_code: &'a str,
    pub tokens: SharedVector<Token>,
    pub new_line_offsets: SharedVector<u32>,
}

//=====================================================================================================================

// Converts the given source code to an array of tokens plus an array of new line character offsets.
pub fn scan(source_code: &str) -> Outcome {

    // Create a scanner.
    let mut scanner: Scanner = Scanner::new(source_code);

    // Scan the entire source code.
    scanner.scan();

    // Extract the results.
    return Outcome {
        source_code,
        tokens: scanner.tokens.into_shared(),
        new_line_offsets: scanner.new_line_offsets.into_shared(),
    };
}

//=====================================================================================================================

// Converts a string of Lligne source code into tokens.
struct Scanner<'a> {
    source_code: &'a str,
    source_code_iter: Chars<'a>,
    marked_pos: u32,
    current_pos: u32,
    char_ahead_1: char,
    char_ahead_2: char,
    tokens: Vector<Token>,
    new_line_offsets: Vector<u32>,
}

impl<'a> Scanner<'a> {
//---------------------------------------------------------------------------------------------------------------------

    // Allocates a new scanner for given source_code.
    fn new(source_code: &'a str) -> Self {
        let mut source_code_iter = source_code.chars();
        let char_ahead_1 = source_code_iter.next();
        let char_ahead_2 = source_code_iter.next();

        // Create a scanner
        return Scanner {
            source_code,
            source_code_iter,
            marked_pos: 0,
            current_pos: 0,
            char_ahead_1: char_ahead_1.unwrap_or('\0'),
            char_ahead_2: char_ahead_2.unwrap_or('\0'),
            new_line_offsets: Vector::new(),
            tokens: Vector::new(),
        };
    }

//---------------------------------------------------------------------------------------------------------------------

    // Converts the source code to an array of tokens
    fn scan(&mut self) {
        loop {
            let token = self.read_token();

            if token.token_type == token_types::EOF {
                self.tokens.push(token.clone());
                self.tokens.push(token.clone());
                self.tokens.push(token);
                break;
            } else {
                self.tokens.push(token);
            }
        }
    }

//---------------------------------------------------------------------------------------------------------------------

    // Returns the next token from the scanner.
    fn read_token(&mut self) -> Token {

        // Ignore whitespace
        while self.char_ahead_1.is_whitespace() {
            self.advance();
        }

        // Mark the start of the token
        self.marked_pos = self.current_pos;

        // Consume the next character.
        let ch = self.char_ahead_1;
        self.advance();

        // Handle character ranges.
        if is_identifier_start(ch) {
            return self.scan_identifier_or_keyword();
        }
        if is_digit(ch) {
            return self.scan_number();
        }

        // Handle individual characters.
        return match ch {
            '&' => self.one_or_two_char_token(token_types::AMPERSAND, '&', token_types::AMPERSAND_AMPERSAND),
            '*' => self.token(token_types::ASTERISK),
            '`' => self.scan_back_ticked_string(),
            ':' => self.token(token_types::COLON),
            ',' => self.token(token_types::COMMA),
            '-' => self.one_or_two_char_token(token_types::DASH, '>', token_types::RIGHT_ARROW),
            '.' => self.one_to_three_char_token(token_types::DOT, '.', token_types::DOT_DOT, '.', token_types::DOT_DOT_DOT),
            '=' => self.scan_after_equals(),
            '!' => self.scan_after_exclamation_mark(),
            '<' => self.one_or_two_char_token(token_types::LESS_THAN, '=', token_types::LESS_THAN_OR_EQUALS),
            '>' => self.one_or_two_char_token(token_types::GREATER_THAN, '=', token_types::GREATER_THAN_OR_EQUALS),
            '{' => self.token(token_types::LEFT_BRACE),
            '[' => self.token(token_types::LEFT_BRACKET),
            '(' => self.token(token_types::LEFT_PARENTHESIS),
            '+' => self.token(token_types::PLUS),
            '?' => self.one_or_two_char_token(token_types::QUESTION, ':', token_types::QUESTION_COLON),
            '}' => self.token(token_types::RIGHT_BRACE),
            ']' => self.token(token_types::RIGHT_BRACKET),
            ')' => self.token(token_types::RIGHT_PARENTHESIS),
            ';' => self.token(token_types::SEMICOLON),
            '/' => self.scan_after_slash(),
            '"' => self.scan_double_quoted_string(),
            '\'' => self.scan_single_quoted_string(),
            '|' => self.token(token_types::VERTICAL_BAR),
            '\0' => self.eof_token(),
            _ => self.token(token_types::UNRECOGNIZED_CHAR),
        };
    }

//---------------------------------------------------------------------------------------------------------------------

    // Consumes one rune and stages the next one in the scanner.
    fn advance(&mut self) {
        if self.char_ahead_1 == '\n' {
            self.new_line_offsets.push(self.current_pos)
        }

        self.current_pos += self.char_ahead_1.len_utf8() as u32;
        self.char_ahead_1 = self.char_ahead_2;

        self.char_ahead_2 = self.source_code_iter.next().unwrap_or('\0');
    }

//---------------------------------------------------------------------------------------------------------------------

    // Builds a new EOF token for the marked position.
    fn eof_token(&mut self) -> Token {
        return Token {
            source_offset: self.marked_pos,
            source_length: 0,
            token_type: token_types::EOF,
        };
    }

//---------------------------------------------------------------------------------------------------------------------

    // Scans a sequence of characters that could be one or two characters in length.
    fn one_or_two_char_token(
        &mut self,
        one_char_type: u16,
        second_char: char,
        two_char_type: u16,
    ) -> Token {
        if self.char_ahead_1 == second_char {
            self.advance();
            return self.token(two_char_type);
        }

        return self.token(one_char_type);
    }

//---------------------------------------------------------------------------------------------------------------------

    // Scans a sequence of runes that could be one, two, or three characters in length.
    fn one_to_three_char_token(
        &mut self,
        one_char_type: u16,
        second_char: char,
        two_char_type: u16,
        third_char: char,
        three_char_type: u16,
    ) -> Token {
        if self.char_ahead_1 == second_char {
            self.advance();

            if self.char_ahead_1 == third_char {
                self.advance();
                return self.token(three_char_type);
            }

            return self.token(two_char_type);
        }

        return self.token(one_char_type);
    }

//---------------------------------------------------------------------------------------------------------------------

    // Scans one of: '=', '==', '===', '=~'.
    fn scan_after_equals(&mut self) -> Token {
        if self.char_ahead_1 == '=' {
            self.advance();

            if self.char_ahead_1 == '=' {
                self.advance();
                return self.token(token_types::EQUALS_EQUALS_EQUALS);
            }

            return self.token(token_types::EQUALS_EQUALS);
        }

        if self.char_ahead_1 == '~' {
            self.advance();
            return self.token(token_types::EQUALS_TILDE);
        }

        return self.token(token_types::EQUALS);
    }

//---------------------------------------------------------------------------------------------------------------------

    // Scans one of: '!', '!=', '!~'.
    fn scan_after_exclamation_mark(&mut self) -> Token {
        if self.char_ahead_1 == '=' {
            self.advance();
            return self.token(token_types::EXCLAMATION_EQUALS);
        }

        if self.char_ahead_1 == '~' {
            self.advance();
            return self.token(token_types::EXCLAMATION_TILDE);
        }

        return self.token(token_types::EXCLAMATION);
    }

//---------------------------------------------------------------------------------------------------------------------

    // Scans either just the slash or else a comment extending to the end of the line.
    fn scan_after_slash(&mut self) -> Token {
        if self.char_ahead_1 == '/' {
            self.advance();
            return self.scan_documentation();
        }

        return self.token(token_types::SLASH);
    }

//---------------------------------------------------------------------------------------------------------------------

    // Consumes a multiline back-ticked string.
    fn scan_back_ticked_string(&mut self) -> Token {
        let mark = self.marked_pos;

        loop {

            // Consume to the end of the line.
            while self.char_ahead_1 != '\n' && self.char_ahead_1 != '\0' {
                self.advance()
            }

            // Quit if hit the end of input.
            if self.char_ahead_1 == '\0' {
                break;
            }

            self.advance();

            // Ignore whitespace
            while self.char_ahead_1 != '\n' && self.char_ahead_1.is_whitespace() {
                self.advance()
            }

            // Quit after seeing something other than another back-ticked string on the subsequent line.
            if self.char_ahead_1 != '`' {
                break;
            }

            // Mark the start of the next line and consume the back tick
            self.marked_pos = self.current_pos;
            self.advance();
        }

        return Token {
            source_offset: mark,
            source_length: (self.current_pos - mark) as u16,
            token_type: token_types::BACK_TICKED_STRING,
        };
    }

//---------------------------------------------------------------------------------------------------------------------

    // Consumes a multiline comment.
    fn scan_documentation(&mut self) -> Token {
        let mark = self.marked_pos;

        loop {

            // Consume to the end of the line.
            while self.char_ahead_1 != '\n' && self.char_ahead_1 != '\0' {
                self.advance();
            }

            // Quit if hit the end of input.
            if self.char_ahead_1 == '\0' {
                break;
            }

            self.advance();

            // Ignore whitespace
            while self.char_ahead_1 != '\n' && self.char_ahead_1.is_whitespace() {
                self.advance()
            }

            // Quit after seeing something other than another documentation opener on the subsequent line.
            if self.char_ahead_1 != '/' || self.char_ahead_2 != '/' {
                break;
            }

            // Mark the start of the next line and consume the "//"
            self.marked_pos = self.current_pos;
            self.advance();
            self.advance();
        }

        return Token {
            source_offset: mark,
            source_length: (self.current_pos - mark) as u16,
            token_type: token_types::DOCUMENTATION,
        };
    }

//---------------------------------------------------------------------------------------------------------------------

    // Scans the remainder of a string literal after the initial double quote character has been consumed.
    fn scan_double_quoted_string(&mut self) -> Token {
        loop {
            if self.char_ahead_1 == '"' {
                self.advance();
                return self.token(token_types::DOUBLE_QUOTED_STRING);
            }

            if self.char_ahead_1 == '\\' {
                self.advance();
                // TODO: handle escape sequences properly
                self.advance();
            }

            if self.char_ahead_1 == '\n' {
                return self.token(token_types::UNCLOSED_DOUBLE_QUOTED_STRING);
            }
            self.advance()
        }
    }

//---------------------------------------------------------------------------------------------------------------------

    // Scans the remainder of an identifier after the opening letter has been consumed.
    fn scan_identifier_or_keyword(&mut self) -> Token {
        while is_identifier_part(self.char_ahead_1, self.char_ahead_2) {
            self.advance();
        }

        let text_range = (self.marked_pos as usize)..(self.current_pos as usize);
        let text = &self.source_code[text_range];

        let keywords = keywords();
        let keyword_token_type = keywords.get(&text);
        match keyword_token_type {
            Some(token_type) => return Token {
                source_offset: self.marked_pos,
                source_length: (self.current_pos - self.marked_pos) as u16,
                token_type: *token_type,
            },
            _ => {}
        }

        if built_in_types().contains(text) {
            return Token {
                source_offset: self.marked_pos,
                source_length: (self.current_pos - self.marked_pos) as u16,
                token_type: token_types::BUILT_IN_TYPE,
            };
        }

        return Token {
            source_offset: self.marked_pos,
            source_length: (self.current_pos - self.marked_pos) as u16,
            token_type: token_types::IDENTIFIER,
        };
    }

//---------------------------------------------------------------------------------------------------------------------

    // Scans a numeric literal after the opening digit has been consumed.
    fn scan_number(&mut self) -> Token {
        while is_digit(self.char_ahead_1) {
            self.advance();
        }

        if self.char_ahead_1 == '.' && is_digit(self.char_ahead_2) {
            self.advance();
            return self.scan_number_floating_point();
        }

        return self.token(token_types::INTEGER_LITERAL);
    }

//---------------------------------------------------------------------------------------------------------------------

    // Scans a floating point literal after the decimal point has been consumed.
    fn scan_number_floating_point(&mut self) -> Token {
        while is_digit(self.char_ahead_1) {
            self.advance();
        }

        // TODO: exponents

        return self.token(token_types::FLOATING_POINT_LITERAL);
    }

//---------------------------------------------------------------------------------------------------------------------

    // Scans the remainder of a string literal after the initial single quote character has been consumed.
    fn scan_single_quoted_string(&mut self) -> Token {
        loop {
            if self.char_ahead_1 == '\'' {
                self.advance();
                return self.token(token_types::SINGLE_QUOTED_STRING);
            }

            if self.char_ahead_1 == '\\' {
                self.advance();
                // TODO: handle escape sequences properly
                self.advance();
            }

            if self.char_ahead_1 == '\n' {
                return self.token(token_types::UNCLOSED_SINGLE_QUOTED_STRING);
            }
            self.advance()
        }
    }

//---------------------------------------------------------------------------------------------------------------------

    // Builds a new token of given type with text from the marked position to the current position.
    fn token(&mut self, token_type: u16) -> Token {
        return Token {
            source_offset: self.marked_pos,
            source_length: (self.current_pos - self.marked_pos) as u16,
            token_type,
        };
    }

//---------------------------------------------------------------------------------------------------------------------
}

//=====================================================================================================================

#[once]
fn built_in_types() -> HashSet<&'static str> {
    let mut result = HashSet::new();

    result.insert("Bool");
    result.insert("Float64");
    result.insert("Int64");
    result.insert("String");

    return result;
}

//=====================================================================================================================

// Determines whether a character is a number.
fn is_digit(ch: char) -> bool {
    return '0' <= ch && ch <= '9' || ch >= '\u{0080}' && ch.is_numeric();
}

//---------------------------------------------------------------------------------------------------------------------

// Determines whether a given rune could be the second or later character of an identifier.
fn is_identifier_part(ch: char, ch_next: char) -> bool {
    return is_identifier_start(ch) || is_digit(ch) ||
        ch == '-' && (is_identifier_start(ch_next) || is_digit(ch_next));
}

//---------------------------------------------------------------------------------------------------------------------

// Determines whether a given rune could be the opening character of an identifier.
fn is_identifier_start(ch: char) -> bool {
    return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || ch == '_' || ch >= '\u{0080}' && ch.is_alphabetic();
}

//=====================================================================================================================

#[once]
fn keywords() -> HashMap<&'static str, u16> {
    let mut result = HashMap::new();

    result.insert(text_of_token_type(token_types::AND), token_types::AND);
    result.insert(text_of_token_type(token_types::AS), token_types::AS);
    result.insert(text_of_token_type(token_types::FALSE), token_types::FALSE);
    result.insert(text_of_token_type(token_types::IN), token_types::IN);
    result.insert(text_of_token_type(token_types::IS), token_types::IS);
    result.insert(text_of_token_type(token_types::NOT), token_types::NOT);
    result.insert(text_of_token_type(token_types::OR), token_types::OR);
    result.insert(text_of_token_type(token_types::TRUE), token_types::TRUE);
    result.insert(text_of_token_type(token_types::WHEN), token_types::WHEN);
    result.insert(text_of_token_type(token_types::WHERE), token_types::WHERE);

    return result;
}

//=====================================================================================================================

#[cfg(test)]
mod tests {
    use super::*;

    fn expect_token(
        outcome: &Outcome,
        index: usize,
        expected_token_type: u16,
        expected_source_offset: u32,
        expected_length: u16,
    ) {
        let token = outcome.tokens.get(index).unwrap();
        assert_eq!(expected_token_type, token.token_type, "Wrong token type");
        assert_eq!(expected_source_offset, token.source_offset, "Wrong source offset");
        assert_eq!(expected_length, token.source_length, "Wrong source length")
    }

    #[test]
    fn test_minimal_scan() {
        let outcome = scan("(1+2)");
        assert_eq!(0, outcome.new_line_offsets.len());
        assert_eq!(8, outcome.tokens.len());
        expect_token(&outcome, 0, token_types::LEFT_PARENTHESIS, 0, 1);
        expect_token(&outcome, 1, token_types::INTEGER_LITERAL, 1, 1);
        expect_token(&outcome, 2, token_types::PLUS, 2, 1);
        expect_token(&outcome, 3, token_types::INTEGER_LITERAL, 3, 1);
        expect_token(&outcome, 4, token_types::RIGHT_PARENTHESIS, 4, 1);
        expect_token(&outcome, 5, token_types::EOF, 5, 0);
        expect_token(&outcome, 6, token_types::EOF, 5, 0);
        expect_token(&outcome, 7, token_types::EOF, 5, 0);
    }

    #[test]
    fn test_identifiers_and_keywords() {
        let outcome = scan("(one is two) where {one: 1, two:2}");
        assert_eq!(0, outcome.new_line_offsets.len());
        assert_eq!(18, outcome.tokens.len());
        expect_token(&outcome, 0, token_types::LEFT_PARENTHESIS, 0, 1);
        expect_token(&outcome, 1, token_types::IDENTIFIER, 1, 3);
        expect_token(&outcome, 2, token_types::IS, 5, 2);
        expect_token(&outcome, 3, token_types::IDENTIFIER, 8, 3);
        expect_token(&outcome, 4, token_types::RIGHT_PARENTHESIS, 11, 1);
        expect_token(&outcome, 5, token_types::WHERE, 13, 5);
        expect_token(&outcome, 6, token_types::LEFT_BRACE, 19, 1);
        expect_token(&outcome, 7, token_types::IDENTIFIER, 20, 3);
        expect_token(&outcome, 8, token_types::COLON, 23, 1);
        expect_token(&outcome, 9, token_types::INTEGER_LITERAL, 25, 1);
        expect_token(&outcome, 10, token_types::COMMA, 26, 1);
        expect_token(&outcome, 11, token_types::IDENTIFIER, 28, 3);
        expect_token(&outcome, 12, token_types::COLON, 31, 1);
        expect_token(&outcome, 13, token_types::INTEGER_LITERAL, 32, 1);
        expect_token(&outcome, 14, token_types::RIGHT_BRACE, 33, 1);
        expect_token(&outcome, 15, token_types::EOF, 34, 0);
        expect_token(&outcome, 16, token_types::EOF, 34, 0);
        expect_token(&outcome, 17, token_types::EOF, 34, 0);
    }

    #[test]
    fn test_empty_string() {
        let outcome = scan("");
        assert_eq!(0, outcome.new_line_offsets.len());
        assert_eq!(3, outcome.tokens.len());
        expect_token(&outcome, 0, token_types::EOF, 0, 0);
        expect_token(&outcome, 1, token_types::EOF, 0, 0);
        expect_token(&outcome, 2, token_types::EOF, 0, 0);
    }

    #[test]
    fn test_unrecognized_char() {
        let outcome = scan("‽");
        assert_eq!(0, outcome.new_line_offsets.len());
        assert_eq!(4, outcome.tokens.len());
        expect_token(&outcome, 0, token_types::UNRECOGNIZED_CHAR, 0, 3);
        expect_token(&outcome, 1, token_types::EOF, 3, 0);
        expect_token(&outcome, 2, token_types::EOF, 3, 0);
        expect_token(&outcome, 3, token_types::EOF, 3, 0);
    }

    #[test]
    fn test_punctuation_tokens() {
        let outcome = scan("& &&\n *: , ");
        assert_eq!(1, outcome.new_line_offsets.len());
        assert_eq!(8, outcome.tokens.len());
        expect_token(&outcome, 0, token_types::AMPERSAND, 0, 1);
        expect_token(&outcome, 1, token_types::AMPERSAND_AMPERSAND, 2, 2);
        expect_token(&outcome, 2, token_types::ASTERISK, 6, 1);
        expect_token(&outcome, 3, token_types::COLON, 7, 1);
        expect_token(&outcome, 4, token_types::COMMA, 9, 1);
        expect_token(&outcome, 5, token_types::EOF, 11, 0);
        expect_token(&outcome, 6, token_types::EOF, 11, 0);
        expect_token(&outcome, 7, token_types::EOF, 11, 0);
    }

    #[test]
    fn test_identifier_tokens() {
        let outcome = scan("a bb c23_f q-code _dfg");
        assert_eq!(0, outcome.new_line_offsets.len());
        assert_eq!(8, outcome.tokens.len());
        expect_token(&outcome, 0, token_types::IDENTIFIER, 0, 1);
        expect_token(&outcome, 1, token_types::IDENTIFIER, 2, 2);
        expect_token(&outcome, 2, token_types::IDENTIFIER, 5, 5);
        expect_token(&outcome, 3, token_types::IDENTIFIER, 11, 6);
        expect_token(&outcome, 4, token_types::IDENTIFIER, 18, 4);
        expect_token(&outcome, 5, token_types::EOF, 22, 0);
        expect_token(&outcome, 6, token_types::EOF, 22, 0);
        expect_token(&outcome, 7, token_types::EOF, 22, 0);
    }

    #[test]
    fn test_integers() {
        let outcome = scan("123 4\n(99000) 5");
        assert_eq!(1, outcome.new_line_offsets.len());
        assert_eq!(9, outcome.tokens.len());
        expect_token(&outcome, 0, token_types::INTEGER_LITERAL, 0, 3);
        expect_token(&outcome, 1, token_types::INTEGER_LITERAL, 4, 1);
        expect_token(&outcome, 2, token_types::LEFT_PARENTHESIS, 6, 1);
        expect_token(&outcome, 3, token_types::INTEGER_LITERAL, 7, 5);
        expect_token(&outcome, 4, token_types::RIGHT_PARENTHESIS, 12, 1);
        expect_token(&outcome, 5, token_types::INTEGER_LITERAL, 14, 1);
        expect_token(&outcome, 6, token_types::EOF, 15, 0);
        expect_token(&outcome, 7, token_types::EOF, 15, 0);
        expect_token(&outcome, 8, token_types::EOF, 15, 0);
    }

    #[test]
    fn test_numbers() {
        let outcome = scan("12.3 4\n(990.00) 5.1");
        assert_eq!(1, outcome.new_line_offsets.len());
        assert_eq!(9, outcome.tokens.len());
        expect_token(&outcome, 0, token_types::FLOATING_POINT_LITERAL, 0, 4);
        expect_token(&outcome, 1, token_types::INTEGER_LITERAL, 5, 1);
        expect_token(&outcome, 2, token_types::LEFT_PARENTHESIS, 7, 1);
        expect_token(&outcome, 3, token_types::FLOATING_POINT_LITERAL, 8, 6);
        expect_token(&outcome, 4, token_types::RIGHT_PARENTHESIS, 14, 1);
        expect_token(&outcome, 5, token_types::FLOATING_POINT_LITERAL, 16, 3);
        expect_token(&outcome, 6, token_types::EOF, 19, 0);
        expect_token(&outcome, 7, token_types::EOF, 19, 0);
        expect_token(&outcome, 8, token_types::EOF, 19, 0);
    }

    #[test]
    fn test_double_quoted_strings() {
        let outcome = scan(
            r#""abc" "xyz" "bad
 "start over""#,
        );
        assert_eq!(1, outcome.new_line_offsets.len());
        assert_eq!(7, outcome.tokens.len());
        expect_token(&outcome, 0, token_types::DOUBLE_QUOTED_STRING, 0, 5);
        expect_token(&outcome, 1, token_types::DOUBLE_QUOTED_STRING, 6, 5);
        expect_token(&outcome, 2, token_types::UNCLOSED_DOUBLE_QUOTED_STRING, 12, 4);
        expect_token(&outcome, 3, token_types::DOUBLE_QUOTED_STRING, 18, 12);
        expect_token(&outcome, 4, token_types::EOF, 30, 0);
        expect_token(&outcome, 5, token_types::EOF, 30, 0);
        expect_token(&outcome, 6, token_types::EOF, 30, 0);
    }

    #[test]
    fn test_single_quoted_strings() {
        let outcome = scan(
            r#"'abc' 'xyz' 'bad
 'start over'"#,
        );
        assert_eq!(1, outcome.new_line_offsets.len());
        assert_eq!(7, outcome.tokens.len());
        expect_token(&outcome, 0, token_types::SINGLE_QUOTED_STRING, 0, 5);
        expect_token(&outcome, 1, token_types::SINGLE_QUOTED_STRING, 6, 5);
        expect_token(&outcome, 2, token_types::UNCLOSED_SINGLE_QUOTED_STRING, 12, 4);
        expect_token(&outcome, 3, token_types::SINGLE_QUOTED_STRING, 18, 12);
        expect_token(&outcome, 4, token_types::EOF, 30, 0);
        expect_token(&outcome, 5, token_types::EOF, 30, 0);
        expect_token(&outcome, 6, token_types::EOF, 30, 0);
    }

    #[test]
    fn test_each_fixed_text_token() {
        for token_type in 1..token_types::WHERE {
            let source_code = text_of_token_type(token_type);
            let sc_len = source_code.len();

            let outcome = scan(&source_code);
            assert_eq!(0, outcome.new_line_offsets.len());
            assert_eq!(4, outcome.tokens.len());
            expect_token(&outcome, 0, token_type, 0, sc_len as u16);
            expect_token(&outcome, 1, token_types::EOF, sc_len as u32, 0);
            expect_token(&outcome, 2, token_types::EOF, sc_len as u32, 0);
            expect_token(&outcome, 3, token_types::EOF, sc_len as u32, 0);
        }
    }

    #[test]
    fn test_back_ticked_strings() {
        let outcome = scan("`abc 123\n`  - one\n  `  - two\n\n  `another\n\n  `one more\n `and the end");
        assert_eq!(7, outcome.new_line_offsets.len());
        assert_eq!(6, outcome.tokens.len());
        expect_token(&outcome, 0, token_types::BACK_TICKED_STRING, 0, 29);
        expect_token(&outcome, 1, token_types::BACK_TICKED_STRING, 32, 9);
        expect_token(&outcome, 2, token_types::BACK_TICKED_STRING, 44, 23);
        expect_token(&outcome, 3, token_types::EOF, 67, 0);
        expect_token(&outcome, 4, token_types::EOF, 67, 0);
        expect_token(&outcome, 5, token_types::EOF, 67, 0);
    }

    #[test]
    fn test_documentation() {
        let outcome = scan("// abc 123\n//  - one\n//two\n\n//\n//");
        assert_eq!(5, outcome.new_line_offsets.len());
        assert_eq!(5, outcome.tokens.len());
        expect_token(&outcome, 0, token_types::DOCUMENTATION, 0, 27);
        expect_token(&outcome, 1, token_types::DOCUMENTATION, 28, 5);
        expect_token(&outcome, 2, token_types::EOF, 33, 0);
        expect_token(&outcome, 3, token_types::EOF, 33, 0);
        expect_token(&outcome, 4, token_types::EOF, 33, 0);
    }

    #[test]
    fn test_boolean_literals() {
        let outcome = scan("true false");
        assert_eq!(0, outcome.new_line_offsets.len());
        assert_eq!(5, outcome.tokens.len());
        expect_token(&outcome, 0, token_types::TRUE, 0, 4);
        expect_token(&outcome, 1, token_types::FALSE, 5, 5);
        expect_token(&outcome, 2, token_types::EOF, 10, 0);
        expect_token(&outcome, 3, token_types::EOF, 10, 0);
        expect_token(&outcome, 4, token_types::EOF, 10, 0);
    }

    #[test]
    fn test_built_in_types() {
        let outcome = scan("Bool Float64 Int64 String");
        assert_eq!(0, outcome.new_line_offsets.len());
        assert_eq!(7, outcome.tokens.len());
        expect_token(&outcome, 0, token_types::BUILT_IN_TYPE, 0, 4);
        expect_token(&outcome, 1, token_types::BUILT_IN_TYPE, 5, 7);
        expect_token(&outcome, 2, token_types::BUILT_IN_TYPE, 13, 5);
        expect_token(&outcome, 3, token_types::BUILT_IN_TYPE, 19, 6);
        expect_token(&outcome, 4, token_types::EOF, 25, 0);
        expect_token(&outcome, 5, token_types::EOF, 25, 0);
        expect_token(&outcome, 6, token_types::EOF, 25, 0);
    }
}

//=====================================================================================================================


