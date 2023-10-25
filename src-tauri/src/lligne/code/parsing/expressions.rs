//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//


//=====================================================================================================================

use shared_vector::SharedVector;
use crate::lligne::code::util::source_pos::SourcePos;

// TODO: six different string literal variants?
pub enum StringDelimiters {
    SingleQuotes,
    DoubleQuotes,
    BackTicks,
    SingleQuotesMultiline,
    DoubleQuotesMultiline,
    BackTicksMultiline,
}

//=====================================================================================================================

pub enum Expr {
    Addition { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    ArrayLiteral { source_position: SourcePos, elements: SharedVector<Box<Expr>> },
    BooleanLiteral { source_position: SourcePos, value: bool },
    BuiltInType { source_position: SourcePos },
    Division { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    Document { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    Equals { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    FieldReference { source_position: SourcePos, parent: Box<Expr>, child: Box<Expr> },
    Float64Literal { source_position: SourcePos, value: f64 },
    FunctionArguments { source_position: SourcePos, items: SharedVector<Box<Expr>> },
    FunctionArrow { source_position: SourcePos, argument: Box<Expr>, result: Box<Expr> },
    FunctionCall { source_position: SourcePos, function_reference: Box<Expr>, argument: Box<Expr> },
    GreaterThan { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    GreaterThanOrEquals { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    Identifier { source_position: SourcePos },
    In { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    Int64Literal { source_position: SourcePos, value: i64 },
    Intersect { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    IntersectAssignValue { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    IntersectDefaultValue { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    IntersectLowPrecedence { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    Is { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    LeadingDocumentation { source_position: SourcePos },
    LessThan { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    LessThanOrEquals { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    LogicalAnd { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    LogicalNotOperation { source_position: SourcePos, operand: Box<Expr> },
    LogicalOr { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    Match { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    Multiplication { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    NegationOperation { source_position: SourcePos, operand: Box<Expr> },
    NotEquals { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    NotMatch { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    Optional { source_position: SourcePos, operand: Box<Expr> },
    Parenthesized { source_position: SourcePos, inner_expr: Box<Expr> },
    Qualify { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    Range { source_position: SourcePos, first: Box<Expr>, last: Box<Expr> },
    Record { source_position: SourcePos, items: SharedVector<Box<Expr>> },
    StringLiteral { source_position: SourcePos, delimiters: StringDelimiters },
    Subtraction { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    TrailingDocumentation { source_position: SourcePos },
    Union { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    Unit { source_position: SourcePos },
    When { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
    Where { source_position: SourcePos, lhs: Box<Expr>, rhs: Box<Expr> },
}

//=====================================================================================================================

impl Expr {

    pub fn get_source_position(&self) -> SourcePos {
        return match self {
            Expr::Addition { source_position: result, .. } => result.clone(),
            Expr::ArrayLiteral { source_position: result, .. } => result.clone(),
            Expr::BooleanLiteral { source_position: result, .. } => result.clone(),
            Expr::BuiltInType { source_position: result, .. } => result.clone(),
            Expr::Division { source_position: result, .. } => result.clone(),
            Expr::Document { source_position: result, .. } => result.clone(),
            Expr::Equals { source_position: result, .. } => result.clone(),
            Expr::FieldReference { source_position: result, .. } => result.clone(),
            Expr::Float64Literal { source_position: result, .. } => result.clone(),
            Expr::FunctionArguments { source_position: result, .. } => result.clone(),
            Expr::FunctionArrow { source_position: result, .. } => result.clone(),
            Expr::FunctionCall { source_position: result, .. } => result.clone(),
            Expr::GreaterThan { source_position: result, .. } => result.clone(),
            Expr::GreaterThanOrEquals { source_position: result, .. } => result.clone(),
            Expr::Identifier { source_position: result, .. } => result.clone(),
            Expr::In { source_position: result, .. } => result.clone(),
            Expr::Int64Literal { source_position: result, .. } => result.clone(),
            Expr::Intersect { source_position: result, .. } => result.clone(),
            Expr::IntersectAssignValue { source_position: result, .. } => result.clone(),
            Expr::IntersectDefaultValue { source_position: result, .. } => result.clone(),
            Expr::IntersectLowPrecedence { source_position: result, .. } => result.clone(),
            Expr::Is { source_position: result, .. } => result.clone(),
            Expr::LeadingDocumentation { source_position: result, .. } => result.clone(),
            Expr::LessThan { source_position: result, .. } => result.clone(),
            Expr::LessThanOrEquals { source_position: result, .. } => result.clone(),
            Expr::LogicalAnd { source_position: result, .. } => result.clone(),
            Expr::LogicalNotOperation { source_position: result, .. } => result.clone(),
            Expr::LogicalOr { source_position: result, .. } => result.clone(),
            Expr::Match { source_position: result, .. } => result.clone(),
            Expr::Multiplication { source_position: result, .. } => result.clone(),
            Expr::NegationOperation { source_position: result, .. } => result.clone(),
            Expr::NotEquals { source_position: result, .. } => result.clone(),
            Expr::NotMatch { source_position: result, .. } => result.clone(),
            Expr::Optional { source_position: result, .. } => result.clone(),
            Expr::Parenthesized { source_position: result, .. } => result.clone(),
            Expr::Qualify { source_position: result, .. } => result.clone(),
            Expr::Range { source_position: result, .. } => result.clone(),
            Expr::Record { source_position: result, .. } => result.clone(),
            Expr::StringLiteral { source_position: result, .. } => result.clone(),
            Expr::Subtraction { source_position: result, .. } => result.clone(),
            Expr::TrailingDocumentation { source_position: result, .. } => result.clone(),
            Expr::Union { source_position: result, .. } => result.clone(),
            Expr::Unit { source_position: result, .. } => result.clone(),
            Expr::When { source_position: result, .. } => result.clone(),
            Expr::Where { source_position: result, .. } => result.clone(),
        }
    }
}

