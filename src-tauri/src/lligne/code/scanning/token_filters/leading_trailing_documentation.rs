//
// # Scanner for Lligne tokens.
//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

//=====================================================================================================================

use shared_vector::Vector;
use crate::lligne::code::scanning::{scanner, token_types};
use crate::lligne::code::scanning::tokens::Token;

// ProcessLeadingTrailingDocumentation converts multiline documentation tokens to leading or trailing documentation.
pub fn filter(scan_result: scanner::Outcome) -> scanner::Outcome {
    let tokens = scan_result.tokens;
    let mut result: Vector<Token> = Vector::new();

    let mut index = 0;
    while index < tokens.len() - 1 {
        if tokens[index].token_type == token_types::DOCUMENTATION {
            result.push(Token {
                source_offset: tokens[index].source_offset,
                source_length: tokens[index].source_length,
                token_type: token_types::LEADING_DOCUMENTATION,
            });
            result.push(Token {
                source_offset: tokens[index].source_offset,
                source_length: 0,
                token_type: token_types::SYNTH_DOCUMENT,
            });
            index += 1;
        } else if tokens[index + 1].token_type == token_types::DOCUMENTATION {
            if tokens_on_same_line(scan_result.source_code, tokens[index].source_offset, tokens[index + 1].source_offset) {
                if tokens[index].token_type == token_types::COMMA ||
                    tokens[index].token_type == token_types::SEMICOLON {
                    result.push(Token {
                        source_offset: tokens[index + 1].source_offset,
                        source_length: 0,
                        token_type: token_types::SYNTH_DOCUMENT,
                    });
                    result.push(Token {
                        source_offset: tokens[index + 1].source_offset,
                        source_length: tokens[index + 1].source_length,
                        token_type: token_types::TRAILING_DOCUMENTATION,
                    });
                }

                result.push(tokens[index]);

                if tokens[index].token_type != token_types::COMMA &&
                    tokens[index].token_type != token_types::SEMICOLON {
                    result.push(Token {
                        source_offset: tokens[index + 1].source_offset,
                        source_length: 0,
                        token_type: token_types::SYNTH_DOCUMENT,
                    });
                    result.push(Token {
                        source_offset: tokens[index + 1].source_offset,
                        source_length: tokens[index + 1].source_length,
                        token_type: token_types::TRAILING_DOCUMENTATION,
                    });
                }

                index += 2
            } else {
                result.push(tokens[index]);

                result.push(Token {
                    source_offset: tokens[index + 1].source_offset,
                    source_length: tokens[index + 1].source_length,
                    token_type: token_types::LEADING_DOCUMENTATION,
                });
                result.push(Token {
                    source_offset: tokens[index + 1].source_offset,
                    source_length: 0,
                    token_type: token_types::SYNTH_DOCUMENT,
                });
                index += 2;
            }
        } else {
            result.push(tokens[index]);
            index += 1
        }
    }

    return scanner::Outcome {
        source_code: scan_result.source_code,
        tokens: result.into_shared(),
        new_line_offsets: scan_result.new_line_offsets,
    };
}

//---------------------------------------------------------------------------------------------------------------------

// tokens_on_same_line looks for a line feed in the source code between two tokens.
fn tokens_on_same_line(source_code: &str, token1_start_pos: u32, token2_start_pos: u32) -> bool {
    let range = token1_start_pos as usize..token2_start_pos as usize;
    return source_code[range].find('\n').is_none();
}

//=====================================================================================================================

#[cfg(test)]
mod tests {
    use crate::lligne::code::scanning::token_filters::leading_trailing_documentation;
    use super::*;

    fn expect_token(token: Token, expected_token_type: u16, expected_source_offset: u32, expected_length: u16) {
        assert_eq!(expected_token_type, token.token_type);
        assert_eq!(expected_source_offset, token.source_offset);
        assert_eq!(expected_length, token.source_length);
    }

    #[test]
    fn documentation_to_be_translated() {
        let source_code = r#"
// Leading documentation
  // with two lines
stuff {
    inner, // Trailing documentation 1
    more;  // Trailing documentation 2
    another  // Trailing 3
         // documentation

    // Leading documentation after trailing
    onemorevar

	gadget

	// Leading after non-doc
	junk
}
"#;

        let mut scan_result = scanner::scan(source_code);
        scan_result = leading_trailing_documentation::filter(scan_result);
        let tokens = scan_result.tokens;

        expect_token(tokens[0], token_types::LEADING_DOCUMENTATION, 1, 45);
        expect_token(tokens[1], token_types::SYNTH_DOCUMENT, 1, 0);
        expect_token(tokens[2], token_types::IDENTIFIER, 46, 5);
        expect_token(tokens[3], token_types::LEFT_BRACE, 52, 1);
        expect_token(tokens[4], token_types::IDENTIFIER, 58, 5);
        expect_token(tokens[5], token_types::SYNTH_DOCUMENT, 65, 0);
        expect_token(tokens[6], token_types::TRAILING_DOCUMENTATION, 65, 32);
        expect_token(tokens[7], token_types::COMMA, 63, 1);
        expect_token(tokens[8], token_types::IDENTIFIER, 97, 4);
        expect_token(tokens[9], token_types::SYNTH_DOCUMENT, 104, 0);
        expect_token(tokens[10], token_types::TRAILING_DOCUMENTATION, 104, 32);
        expect_token(tokens[11], token_types::SEMICOLON, 101, 1);
        expect_token(tokens[12], token_types::IDENTIFIER, 136, 7);
        expect_token(tokens[13], token_types::SYNTH_DOCUMENT, 145, 0);
        expect_token(tokens[14], token_types::TRAILING_DOCUMENTATION, 145, 40);
        expect_token(tokens[15], token_types::LEADING_DOCUMENTATION, 190, 44);
        expect_token(tokens[16], token_types::SYNTH_DOCUMENT, 190, 0);
        expect_token(tokens[17], token_types::IDENTIFIER, 234, 10);
        expect_token(tokens[18], token_types::IDENTIFIER, 247, 6);
        expect_token(tokens[19], token_types::LEADING_DOCUMENTATION, 256, 26);
        expect_token(tokens[20], token_types::SYNTH_DOCUMENT, 256, 0);
        expect_token(tokens[21], token_types::IDENTIFIER, 282, 4);
        expect_token(tokens[22], token_types::RIGHT_BRACE, 287, 1);
        expect_token(tokens[23], token_types::EOF, source_code.len() as u32, 0);
    }
}

//=====================================================================================================================

