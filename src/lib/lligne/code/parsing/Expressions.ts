//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {SourcePos} from "../util/SourcePos";

//=====================================================================================================================

export type BinaryOperationExprTag =
    | 'Expr#Addition'
    | 'Expr#Division'
    | 'Expr#Document'
    | 'Expr#Equals'
    | 'Expr#FieldReference'
    | 'Expr#FunctionArrow'
    | 'Expr#FunctionCall'
    | 'Expr#GreaterThan'
    | 'Expr#GreaterThanOrEquals'
    | 'Expr#In'
    | 'Expr#Intersect'
    | 'Expr#IntersectAssignValue'
    | 'Expr#IntersectDefaultValue'
    | 'Expr#IntersectLowPrecedence'
    | 'Expr#Is'
    | 'Expr#LessThan'
    | 'Expr#LessThanOrEquals'
    | 'Expr#LogicalAnd'
    | 'Expr#LogicalOr'
    | 'Expr#Match'
    | 'Expr#Multiplication'
    | 'Expr#NotEquals'
    | 'Expr#NotMatch'
    | 'Expr#Qualification'
    | 'Expr#Range'
    | 'Expr#Subtraction'
    | 'Expr#Union'
    | 'Expr#When'
    | 'Expr#Where'
    ;

//=====================================================================================================================

export type BooleanLiteralExprTag =
    | 'Expr#BooleanLiteral'
    ;

//=====================================================================================================================

export type BuiltInTypeExprTag =
    | 'Expr#Boolean'
    | 'Expr#Int64'
    | 'Expr#Float64'
    | 'Expr#String'
    ;

//=====================================================================================================================

export type CompositeExprTag =
    | 'Expr#FunctionArguments'
    | 'Expr#Record'
    ;

//=====================================================================================================================

export type DocumentationExprTag =
    | 'Expr#LeadingDocumentation'
    | 'Expr#TrailingDocumentation'
    ;

//=====================================================================================================================

export type EmptyExprTag =
    | 'Expr#Empty'
    ;

//=====================================================================================================================

export type Float64LiteralExprTag =
    | 'Expr#Float64Literal'
    ;

//=====================================================================================================================

export type IdentifierExprTag =
    | 'Expr#Identifier'
    ;

//=====================================================================================================================

export type Int64LiteralExprTag =
    | 'Expr#Int64Literal'
    ;

//=====================================================================================================================

export type SequenceExprTag =
    | 'Expr#ArrayLiteral'
    ;

//=====================================================================================================================

// String literals distinguished by start/stop delimiters.
export type StringLiteralExprTag =
    | 'Expr#SingleQuotedString'
    | 'Expr#DoubleQuotedString'
    | 'Expr#BackTickedString'
    | 'Expr#SingleQuotedMultilineString'
    | 'Expr#DoubleQuotedMultilineString'
    | 'Expr#BackTickedMultilineString'
    ;

//=====================================================================================================================

export type UnaryOperationExprTag =
    | 'Expr#LogicalNot'
    | 'Expr#Negation'
    | 'Expr#Optional'
    | 'Expr#Parenthesized'
    ;

//=====================================================================================================================

// BooleanLiteralExpr represents a single boolean literal.
export type BooleanLiteralExpr = {
    tag: BooleanLiteralExprTag,
    sourcePos: SourcePos,
    value: boolean
}

//=====================================================================================================================

// BuiltInTypeExpr represents a single fundamental type name.
export type BuiltInTypeExpr = {
    tag: BuiltInTypeExprTag,
    sourcePos: SourcePos
}

//=====================================================================================================================

// DocumentationExpr represents a leading or trailing documentation comment.
export type DocumentationExpr = {
    tag: DocumentationExprTag,
    sourcePos: SourcePos,
    text: string
}

//=====================================================================================================================

export type EmptyExpr = {
    tag: EmptyExprTag,
    sourcePos: SourcePos
}

//=====================================================================================================================

// Float64LiteralExpr represents a single floating point literal.
export type Float64LiteralExpr = {
    tag: Float64LiteralExprTag,
    sourcePos: SourcePos,
    value: number
}

//=====================================================================================================================

// IdentifierExpr represents a single identifier.
export type IdentifierExpr = {
    tag: IdentifierExprTag,
    sourcePos: SourcePos,
    name: string
}

//=====================================================================================================================

// Int64LiteralExpr represents a single integer literal.
export type Int64LiteralExpr = {
    tag: Int64LiteralExprTag,
    sourcePos: SourcePos,
    value: number
}

//=====================================================================================================================

// OperationExpr is a generic operation involving one or more operands.
export type OperationExpr = {
    tag: BinaryOperationExprTag | CompositeExprTag | SequenceExprTag | UnaryOperationExprTag,
    sourcePos: SourcePos,
    operands: Expr[]
}

//=====================================================================================================================

// StringLiteralExpr represents a single text literal.
export type StringLiteralExpr = {
    tag: StringLiteralExprTag,
    sourcePos: SourcePos,
    value: string
}

//=====================================================================================================================
export type Expr =
    | BooleanLiteralExpr
    | BuiltInTypeExpr
    | DocumentationExpr
    | EmptyExpr
    | Float64LiteralExpr
    | IdentifierExpr
    | Int64LiteralExpr
    | OperationExpr
    | StringLiteralExpr
    ;

//=====================================================================================================================

