//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

use std::collections::HashMap;
use shared_vector::{SharedVector, Vector};
use crate::lligne::code::scanning::{scanner, token_types};
use crate::lligne::code::parsing::expressions::Expr;
use crate::lligne::code::parsing::expressions::StringDelimiters;
use crate::lligne::code::scanning::tokens::Token;
use crate::lligne::code::util::source_pos;
use crate::lligne::code::util::source_pos::new_source_pos;

//=====================================================================================================================

pub struct Outcome<'a> {
    pub source_code: &'a str,
    pub new_line_offsets: SharedVector<u32>,
    pub model: Box<Expr>,
}

//=====================================================================================================================

pub fn parse_expression<'a>(scan_outcome: &'a scanner::Outcome) -> Outcome<'a> {
    let mut parser = LligneParser::new(scan_outcome);

    let model = parser.parse_expr_binding_power(0);

    return Outcome {
        source_code: scan_outcome.source_code,
        new_line_offsets: scan_outcome.new_line_offsets.new_ref(),
        model,
    };
}

//---------------------------------------------------------------------------------------------------------------------

// TODO: ParseTopLevel
// ParseParenthesizedItems parses a non-empty sequence of code expected to be the items within a record literal, e.g.
// the top level of a file.
//func ParseParenthesizedItems(source_code string, tokens []scanning.Token) IExpression {
//	parser := newParser(source_code, tokens)
//
//	return parser.parse_parenthesized_expression(tokens[0], scanning.TokenTypeEof)
//}

//=====================================================================================================================

struct LligneParser<'a> {
    source_code: &'a str,
    tokens: SharedVector<Token>,
    index: usize,
}

//---------------------------------------------------------------------------------------------------------------------

impl<'a> LligneParser<'a> {
    //---------------------------------------------------------------------------------------------------------------------

    fn new(scan_outcome: &'a scanner::Outcome) -> Self {
        return LligneParser {
            source_code: scan_outcome.source_code,
            tokens: scan_outcome.tokens.new_ref(),
            index: 0,
        };
    }

    //---------------------------------------------------------------------------------------------------------------------

    fn parse_expr_binding_power(&mut self, min_binding_power: usize) -> Box<Expr> {
        let mut lhs = self.parse_left_hand_side();

        loop {

            // Look ahead for an operator continuing the expression
            let op_token = self.tokens[self.index].clone();

            // Handle postfix operators ...
            let postfix_ops = binding_powers().postfix;
            let p_binding_power = postfix_ops.get(&op_token.token_type);

            if let Some(ref bp) = p_binding_power {
                if bp.power < min_binding_power {
                    break;
                }

                self.index += 1;

                lhs = self.parse_postfix_expression(op_token, lhs);

                continue;
            }

            // Handle infix operators ...
            let infix_ops = binding_powers().infix;
            let binding_power = infix_ops.get(&op_token.token_type);

            if let Some(ref bp) = binding_power {
                if bp.left < min_binding_power {
                    break;
                }

                self.index += 1;

                lhs = self.parse_infix_operation(op_token, bp, lhs);

                continue;
            }

            break;
        }

        return lhs;
    }

    //---------------------------------------------------------------------------------------------------------------------

    fn parse_function_arguments_expression(
        &mut self,
        token: Token,
    ) -> Box<Expr> {
        let mut items: Vector<Box<Expr>> = Vector::new();

        while self.tokens[self.index].token_type != token_types::RIGHT_PARENTHESIS {
            // Parse one expression.
            items.push(self.parse_expr_binding_power(0));

            if self.tokens[self.index].token_type != token_types::COMMA {
                break;
            }
            self.index += 1
        }

        if self.tokens[self.index].token_type != token_types::RIGHT_PARENTHESIS {
            panic!("Expected right parenthesis.")
        }
        let end_source_pos = new_source_pos(self.tokens[self.index]);
        self.index += 1;

        return Box::new(Expr::FunctionArguments {
            source_position: new_source_pos(token).thru(end_source_pos),
            items: items.into_shared(),
        });
    }

    //---------------------------------------------------------------------------------------------------------------------

    // parse_infix_operation parses an infix expression after the left hand side and the operator token have been consumed
    fn parse_infix_operation(
        &mut self,
        op_token: Token,
        binding_power: &BinaryBindingPower,
        lhs: Box<Expr>,
    ) -> Box<Expr> {
        let rhs = self.parse_expr_binding_power(binding_power.right);

        match op_token.token_type {
            token_types::AMPERSAND =>
                Box::new(Expr::Intersect {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::AMPERSAND_AMPERSAND =>
                Box::new(Expr::IntersectLowPrecedence {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::AND =>
                Box::new(Expr::LogicalAnd {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::ASTERISK =>
                Box::new(Expr::Multiplication {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::COLON =>
                Box::new(Expr::Qualify {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::DASH =>
                Box::new(Expr::Subtraction {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::DOT =>
                Box::new(Expr::FieldReference {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    parent: lhs,
                    child: rhs,
                }),

            token_types::DOT_DOT =>
                Box::new(Expr::Range {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    first: lhs,
                    last: rhs,
                }),

            token_types::EQUALS =>
                Box::new(Expr::IntersectAssignValue {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::EQUALS_EQUALS =>
                Box::new(Expr::Equals {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::EQUALS_TILDE =>
                Box::new(Expr::Match {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::EXCLAMATION_EQUALS =>
                Box::new(Expr::NotEquals {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::EXCLAMATION_TILDE =>
                Box::new(Expr::NotMatch {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::GREATER_THAN =>
                Box::new(Expr::GreaterThan {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::GREATER_THAN_OR_EQUALS =>
                Box::new(Expr::GreaterThanOrEquals {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::IN =>
                Box::new(Expr::In {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::IS =>
                Box::new(Expr::Is {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::LESS_THAN =>
                Box::new(Expr::LessThan {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::LESS_THAN_OR_EQUALS =>
                Box::new(Expr::LessThanOrEquals {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::OR =>
                Box::new(Expr::LogicalOr {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::PLUS =>
                Box::new(Expr::Addition {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::QUESTION_COLON =>
                Box::new(Expr::IntersectDefaultValue {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::RIGHT_ARROW =>
                Box::new(Expr::FunctionArrow {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    argument: lhs,
                    result: rhs,
                }),

            token_types::SLASH =>
                Box::new(Expr::Division {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::SYNTH_DOCUMENT =>
                Box::new(Expr::Document {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::VERTICAL_BAR =>
                Box::new(Expr::Union {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::WHEN =>
                Box::new(Expr::When {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            token_types::WHERE =>
                Box::new(Expr::Where {
                    source_position: lhs.get_source_position().thru(rhs.get_source_position()),
                    lhs,
                    rhs,
                }),

            _ =>
                panic!("Missing case in parse_infix_operation: {}.", op_token.token_type)
        }
    }

    //---------------------------------------------------------------------------------------------------------------------

    fn parse_left_hand_side(&mut self) -> Box<Expr> {
        let token = self.tokens[self.index];
        self.index += 1;

        return match token.token_type {
            token_types::BACK_TICKED_STRING =>
                Box::new(Expr::StringLiteral {
                    source_position: source_pos::new_source_pos(token),
                    delimiters: StringDelimiters::BackTicksMultiline,
                }),

            token_types::BUILT_IN_TYPE =>
                Box::new(Expr::BuiltInType {
                    source_position: source_pos::new_source_pos(token),
                }),

            token_types::DASH =>
                self.parse_negation_operation_expression(token),

            token_types::DOUBLE_QUOTED_STRING =>
                Box::new(Expr::StringLiteral {
                    source_position: source_pos::new_source_pos(token),
                    delimiters: StringDelimiters::DoubleQuotes,
                }),

            token_types::FALSE =>
                Box::new(Expr::BooleanLiteral {
                    source_position: source_pos::new_source_pos(token),
                    value: false,
                }),

            token_types::FLOATING_POINT_LITERAL => {
                let source_position = source_pos::new_source_pos(token);
                let value_str = source_position.get_text(self.source_code);
                let value: f64 = value_str.parse().unwrap();
                return Box::new(Expr::Float64Literal {
                    source_position: source_position,
                    value: value,
                });
            }

            token_types::IDENTIFIER =>
                Box::new(Expr::Identifier {
                    source_position: source_pos::new_source_pos(token),
                }),

            token_types::INTEGER_LITERAL => {
                let source_position = source_pos::new_source_pos(token);
                let value_str = source_position.get_text(self.source_code);
                let value: i64 = value_str.parse().unwrap();
                return Box::new(Expr::Int64Literal {
                    source_position: source_pos::new_source_pos(token),
                    value: value,
                });
            }

            token_types::LEADING_DOCUMENTATION =>
                Box::new(Expr::LeadingDocumentation {
                    source_position: source_pos::new_source_pos(token),
                }),

            token_types::LEFT_BRACE =>
                self.parse_record_expression(token),

            token_types::LEFT_BRACKET =>
                self.parse_sequence_literal(token),

            token_types::LEFT_PARENTHESIS =>
                self.parse_parenthesized_expression(token),

            token_types::NOT =>
                self.parse_logical_not_operation_expression(token),

            token_types::SINGLE_QUOTED_STRING =>
                Box::new(Expr::StringLiteral {
                    source_position: source_pos::new_source_pos(token),
                    delimiters: StringDelimiters::SingleQuotes,
                }),

            token_types::TRAILING_DOCUMENTATION =>
                Box::new(Expr::TrailingDocumentation {
                    source_position: source_pos::new_source_pos(token),
                }),

            token_types::TRUE =>
                Box::new(Expr::BooleanLiteral {
                    source_position: source_pos::new_source_pos(token),
                    value: true,
                }),

            //	default:
            //	this.expectedType(
            //	LlaceTokenType.CHAR_LITERAL,
            //	LlaceTokenType.DASH,
            //	LlaceTokenType.IDENTIFIER,
            //	LlaceTokenType.INTEGER_LITERAL,
            //	LlaceTokenType.STRING_LITERAL
            //	)

            _ => panic!("Unfinished parsing code: {}.'", token.token_type)
        };
    }

    //---------------------------------------------------------------------------------------------------------------------

    fn parse_logical_not_operation_expression(
        &mut self,
        token: Token,
    ) -> Box<Expr> {
        let prefix_ops = binding_powers().prefix;
        let binding_power = prefix_ops.get(&token.token_type).unwrap();

        let rhs = self.parse_expr_binding_power(binding_power.power);
        return Box::new(Expr::LogicalNotOperation {
            source_position: new_source_pos(token),
            operand: rhs,
        });
    }

    //---------------------------------------------------------------------------------------------------------------------

    fn parse_negation_operation_expression(
        &mut self,
        token: Token,
    ) -> Box<Expr> {
        let prefix_ops = binding_powers().prefix;
        let binding_power = prefix_ops.get(&token.token_type).unwrap();

        let rhs = self.parse_expr_binding_power(binding_power.power);
        return Box::new(Expr::NegationOperation {
            source_position: new_source_pos(token).thru(rhs.get_source_position()),
            operand: rhs,
        });
    }

    //---------------------------------------------------------------------------------------------------------------------

    fn parse_parenthesized_expression(
        &mut self,
        token: Token,
    ) -> Box<Expr> {

        // Handle empty parentheses specially.
        if self.tokens[self.index].token_type == token_types::RIGHT_PARENTHESIS {
            let end_source_pos = new_source_pos(self.tokens[self.index]);
            self.index += 1;

            return Box::new(Expr::Unit {
                source_position: new_source_pos(token).thru(end_source_pos),
            });
        }

        // Parse one expression.
        let inner = self.parse_expr_binding_power(0);

        // Comma means function parameters
        if self.tokens[self.index].token_type == token_types::COMMA {
            self.index += 1;

            let mut items: Vector<Box<Expr>> = Vector::new();
            items.push(inner);

            while self.tokens[self.index].token_type != token_types::RIGHT_PARENTHESIS {
                // Parse one expression.
                items.push(self.parse_expr_binding_power(0));

                if self.tokens[self.index].token_type != token_types::COMMA {
                    break;
                }
                self.index += 1
            }

            if self.tokens[self.index].token_type != token_types::RIGHT_PARENTHESIS {
                panic!("Expected right parenthesis.")
            }
            let end_source_pos = new_source_pos(self.tokens[self.index]);
            self.index += 1;

            return Box::new(Expr::FunctionArguments {
                source_position: new_source_pos(token).thru(end_source_pos),
                items: items.into_shared(),
            });
        }

        if self.tokens[self.index].token_type != token_types::RIGHT_PARENTHESIS {
            panic!("Expected right parenthesis.")
        }

        let end_source_pos = new_source_pos(self.tokens[self.index]);
        self.index += 1;

        return Box::new(Expr::Parenthesized {
            source_position: new_source_pos(token).thru(end_source_pos),
            inner_expr: inner,
        });
    }

    //---------------------------------------------------------------------------------------------------------------------

    fn parse_postfix_expression(&mut self, op_token: Token, lhs: Box<Expr>) -> Box<Expr> {
        return match op_token.token_type {
            token_types::LEFT_PARENTHESIS => {
                let args = self.parse_function_arguments_expression(op_token);
                return Box::new(Expr::FunctionCall {
                    source_position: lhs.get_source_position().thru(args.get_source_position()),
                    function_reference: lhs,
                    argument: args,
                });
            }

            token_types::QUESTION =>
                Box::new(Expr::Optional {
                    source_position: lhs.get_source_position(),
                    operand: lhs,
                }),

            _ => panic!("Unfinished postfix parsing code: '{}'.", op_token.token_type)
        };
    }

    //---------------------------------------------------------------------------------------------------------------------

    fn parse_record_expression(
        &mut self,
        token: Token,
    ) -> Box<Expr> {
        let mut items: Vector<Box<Expr>> = Vector::new();

        while self.tokens[self.index].token_type != token_types::RIGHT_BRACE {
            // Parse one expression.
            items.push(self.parse_expr_binding_power(0));

            if self.tokens[self.index].token_type != token_types::COMMA {
                break;
            }
            self.index += 1
        }

        if self.tokens[self.index].token_type != token_types::RIGHT_BRACE {
            panic!("Expected right brace");
        }
        let end_source_pos = new_source_pos(self.tokens[self.index]);
        self.index += 1;

        return Box::new(Expr::Record {
            source_position: new_source_pos(token).thru(end_source_pos),
            items: items.into_shared(),
        });
    }

    //---------------------------------------------------------------------------------------------------------------------

    fn parse_sequence_literal(&mut self, token: Token) -> Box<Expr> {
        let start_source_pos = new_source_pos(token);
        let mut items: Vector<Box<Expr>> = Vector::new();

        if self.tokens[self.index].token_type == token_types::RIGHT_BRACKET {
            let end_source_pos = new_source_pos(self.tokens[self.index]);
            self.index += 1;
            return Box::new(Expr::ArrayLiteral {
                source_position: start_source_pos.thru(end_source_pos),
                elements: items.into_shared(),
            });
        }

        while self.tokens[self.index].token_type != token_types::RIGHT_BRACKET {
            // Parse one expression.
            items.push(self.parse_expr_binding_power(0));

            if self.tokens[self.index].token_type != token_types::COMMA {
                break;
            }
            self.index += 1
        }

        if self.tokens[self.index].token_type != token_types::RIGHT_BRACKET {
            panic!("Expected right bracket")
        }
        let end_source_pos = new_source_pos(self.tokens[self.index]);
        self.index += 1;

        return Box::new(Expr::ArrayLiteral {
            source_position: start_source_pos.thru(end_source_pos),
            elements: items.into_shared(),
        });
    }

    //=====================================================================================================================
}

struct BinaryBindingPower {
    left: usize,
    right: usize,
}

//=====================================================================================================================

struct UnaryBindingPower {
    power: usize,
}

//=====================================================================================================================

struct BindingPowers {
    infix: HashMap<u16, BinaryBindingPower>,
    prefix: HashMap<u16, UnaryBindingPower>,
    postfix: HashMap<u16, UnaryBindingPower>,
}

//=====================================================================================================================

fn binding_powers() -> BindingPowers {
    let mut infix_binding_powers = HashMap::new();
    let mut prefix_binding_powers = HashMap::new();
    let mut postfix_binding_powers = HashMap::new();

    let mut level = 1;

    infix_binding_powers.insert(token_types::COLON, BinaryBindingPower { left: level, right: level + 1 });
    infix_binding_powers.insert(token_types::EQUALS, BinaryBindingPower { left: level, right: level + 1 });
    infix_binding_powers.insert(token_types::QUESTION_COLON, BinaryBindingPower { left: level, right: level + 1 });

    level += 2;

    infix_binding_powers.insert(token_types::AMPERSAND_AMPERSAND, BinaryBindingPower { left: level, right: level + 1 });

    level += 2;

    infix_binding_powers.insert(token_types::VERTICAL_BAR, BinaryBindingPower { left: level, right: level + 1 });

    level += 2;

    infix_binding_powers.insert(token_types::AMPERSAND, BinaryBindingPower { left: level, right: level + 1 });

    level += 2;

    infix_binding_powers.insert(token_types::WHEN, BinaryBindingPower { left: level, right: level + 1 });
    infix_binding_powers.insert(token_types::WHERE, BinaryBindingPower { left: level, right: level + 1 });

    level += 2;

    infix_binding_powers.insert(token_types::SYNTH_DOCUMENT, BinaryBindingPower { left: level, right: level + 1 });

    level += 2;

    infix_binding_powers.insert(token_types::OR, BinaryBindingPower { left: level, right: level + 1 });

    level += 2;

    infix_binding_powers.insert(token_types::AND, BinaryBindingPower { left: level, right: level + 1 });

    level += 2;

    prefix_binding_powers.insert(token_types::NOT, UnaryBindingPower { power: level });

    level += 2;

    infix_binding_powers.insert(token_types::EQUALS_EQUALS, BinaryBindingPower { left: level, right: level + 1 });
    infix_binding_powers.insert(token_types::EXCLAMATION_EQUALS, BinaryBindingPower { left: level, right: level + 1 });
    infix_binding_powers.insert(token_types::GREATER_THAN, BinaryBindingPower { left: level, right: level + 1 });
    infix_binding_powers.insert(token_types::GREATER_THAN_OR_EQUALS, BinaryBindingPower { left: level, right: level + 1 });
    infix_binding_powers.insert(token_types::LESS_THAN, BinaryBindingPower { left: level, right: level + 1 });
    infix_binding_powers.insert(token_types::LESS_THAN_OR_EQUALS, BinaryBindingPower { left: level, right: level + 1 });

    level += 2;

    infix_binding_powers.insert(token_types::IN, BinaryBindingPower { left: level, right: level + 1 });
    infix_binding_powers.insert(token_types::IS, BinaryBindingPower { left: level, right: level + 1 });
    infix_binding_powers.insert(token_types::EQUALS_TILDE, BinaryBindingPower { left: level, right: level + 1 });
    infix_binding_powers.insert(token_types::EXCLAMATION_TILDE, BinaryBindingPower { left: level, right: level + 1 });

    level += 2;

    infix_binding_powers.insert(token_types::DOT_DOT, BinaryBindingPower { left: level, right: level + 1 });

    level += 2;

    infix_binding_powers.insert(token_types::DASH, BinaryBindingPower { left: level, right: level + 1 });
    infix_binding_powers.insert(token_types::PLUS, BinaryBindingPower { left: level, right: level + 1 });

    level += 2;

    infix_binding_powers.insert(token_types::ASTERISK, BinaryBindingPower { left: level, right: level + 1 });
    infix_binding_powers.insert(token_types::SLASH, BinaryBindingPower { left: level, right: level + 1 });

    level += 2;

    prefix_binding_powers.insert(token_types::DASH, UnaryBindingPower { power: level });

    level += 2;

    infix_binding_powers.insert(token_types::RIGHT_ARROW, BinaryBindingPower { left: level, right: level + 1 });

    level += 2;

    infix_binding_powers.insert(token_types::DOT, BinaryBindingPower { left: level, right: level + 1 });

    level += 2;

    postfix_binding_powers.insert(token_types::LEFT_PARENTHESIS, UnaryBindingPower { power: level });
    postfix_binding_powers.insert(token_types::LEFT_BRACKET, UnaryBindingPower { power: level });
    postfix_binding_powers.insert(token_types::QUESTION, UnaryBindingPower { power: level });

    return BindingPowers {
        infix: infix_binding_powers,
        prefix: prefix_binding_powers,
        postfix: postfix_binding_powers,
    };
}

//=====================================================================================================================

#[cfg(test)]
mod tests {
    use crate::lligne::code::scanning::token_filters::leading_trailing_documentation;
    use super::*;

    fn check(source_code: &str) {
        let mut scan_result = scanner::scan(source_code);

        scan_result = leading_trailing_documentation::filter(scan_result);

        let expression = parse_expression(&scan_result);

        assert!(expression.model.get_source_position().start_offset <
            expression.model.get_source_position().end_offset)
    }

    #[test]
    fn test_identifier_literals() {
        check("abc");
        check("\n  d  \n");
    }

    #[test]
    fn test_integer_literals() {
        check("123");
        check("789");
    }

    #[test]
    fn test_floating_point_literals() {
        check("1.23");
        check("78.9");
    }

    #[test]
    fn test_multiline_string_literals() {
        check("` line one\n ` line two\n");
    }

    #[test]
    fn test_string_literals() {
        check(r#""123""#);
        check(r#"'789'"#);
    }

    #[test]
    fn test_leading_documentation() {
        check("// line one\n // line two\nq");
    }

    #[test]
    fn test_trailing_documentation() {
        check("q // line one\n // line two\n")
    }

    #[test]
    fn test_addition() {
        check("x + 1");
        check(" 3 + y");
        check("x + 1.7");
        check(" 3.666 + y");
    }

    #[test]
    fn test_built_in_types() {
        check("x: Int64");
        check("isWorking: Bool");
        check("amount: Float64");
        check("name: String");
    }

    #[test]
    fn test_table_of_expressions() {
        let tests: Vec<&str> = vec![
            "x + 1",
            "q - 4",
            "a - b + 3",
            "a + b + 3",
            "1 * 2",
            "x + 3 * g",
            "a + b / 2 - c",
            "-a",
            "-2 * a - b * -r",
            "a.b.c",
            "x.y + z.q",
            "\"s\"",
            "\"string tied in a knot\"",
            "'c'",
            "(x + 5)",
            "((x + 5) / 3)",
            "()",
            "{}",
            "{x: int && 5}",
            "{x: int && 5, y: string && \"s\"}",
            "{x: int ?: 5, y: string ?: \"s\"}",
            "[]",
            "[1, 2, 3, 4, 5]",
            "true and false",
            "a and b",
            "a and b or c",
            "a and not b",
            "not a or b",
            "1 == 2",
            "1 + 1 == 2 / 1",
            "1 + 1 < 2 / 1",
            "1 + 1 <= 2 / 1",
            "1 + 1 >= 2 / 1",
            "x =~ y",
            "x !~ y",
            "int?",
            "float | int?",
            "float & 7.0",
            "f(x: 0)",
            "(a: f(x: 0))",
            "1..9",
            "x in 1..9",
            "x is Widget",
            "1 when n == 0\n| n * f(n - 1) when n > 0",
            "f: (n: int) -> int = 1 when n == 0\n| n * f(n-1) when n > 0",
            "x = y + z where {y: 3, z: 5}",
        ];

        tests.iter().for_each(|test| check(test));
    }
}

//=====================================================================================================================

