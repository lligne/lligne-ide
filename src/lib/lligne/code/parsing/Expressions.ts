//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {SourcePos} from "../util/SourcePos";

//=====================================================================================================================

export type BinaryOperatorType =
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

export type BuiltInType =
    | 'Expr#Boolean'
    | 'Expr#Int64'
    | 'Expr#Float64'
    | 'Expr#String'
    ;

//=====================================================================================================================

export type CompositeType =
    | 'Expr#ArrayLiteral'
    | 'Expr#FunctionArguments'
    | 'Expr#Record'
;

//=====================================================================================================================

export type DocumentationType =
    | 'Expr#LeadingDocumentation'
    | 'Expr#TrailingDocumentation'
;

//=====================================================================================================================

// StringType is an enumeration of start/stop delimiters for string literal expressions.
export type StringType =
    | 'Expr#SingleQuotedString'
    | 'Expr#DoubleQuotedString'
    | 'Expr#BackTickedString'
    | 'Expr#SingleQuotedMultilineString'
    | 'Expr#DoubleQuotedMultilineString'
    | 'Expr#BackTickedMultilineString'
    ;

//=====================================================================================================================

export type UnaryOperatorType =
    | 'Expr#LogicalNot'
    | 'Expr#Negation'
    | 'Expr#Optional'
    | 'Expr#Parenthesized'
    ;

//=====================================================================================================================

export type BinaryOperationExpr = {
    tag: BinaryOperatorType,
    sourcePos: SourcePos,
    lhs: Expr,
    rhs: Expr
}

//=====================================================================================================================

// BooleanLiteralExpr represents a single boolean literal.
export type BooleanLiteralExpr = {
    tag: 'Expr#BooleanLiteral',
    sourcePos: SourcePos,
    value: boolean
}

//=====================================================================================================================

// BuiltInTypeExpr represents a single fundamental type name.
export type BuiltInTypeExpr = {
    tag: BuiltInType,
    sourcePos: SourcePos
}

//=====================================================================================================================

export type CompositeExpr = {
    tag: CompositeType,
    sourcePos: SourcePos,
    items: Expr[]
}

//=====================================================================================================================

// DocumentationExpr represents a leading or trailing documentation comment.
export type DocumentationExpr = {
    tag: DocumentationType,
    sourcePos: SourcePos,
    text: string
}

//=====================================================================================================================

// Float64LiteralExpr represents a single floating point literal.
export type Float64LiteralExpr = {
    tag: 'Expr#Float64Literal',
    sourcePos: SourcePos,
    value: number
}

//=====================================================================================================================

// IdentifierExpr represents a single identifier.
export type IdentifierExpr = {
    tag: 'Expr#Identifier',
    sourcePos: SourcePos,
    text: string
}

//=====================================================================================================================

// Int64LiteralExpr represents a single integer literal.
export type Int64LiteralExpr = {
    tag: 'Expr#Int64Literal',
    sourcePos: SourcePos,
    value: number
}

//=====================================================================================================================

// StringLiteralExpr represents a single textt literal.
export type StringLiteralExpr = {
    tag: StringType,
    sourcePos: SourcePos,
    value: string
}

//=====================================================================================================================

export type UnaryOperationExpr = {
    tag: UnaryOperatorType,
    sourcePos: SourcePos,
    operand: Expr
}

//=====================================================================================================================

export type UnitExpr = {
    tag: 'Expr#Unit',
    sourcePos: SourcePos
}

//=====================================================================================================================

export type Expr =
    | BinaryOperationExpr
    | BooleanLiteralExpr
    | BuiltInTypeExpr
    | CompositeExpr
    | DocumentationExpr
    | Float64LiteralExpr
    | IdentifierExpr
    | Int64LiteralExpr
    | StringLiteralExpr
    | UnaryOperationExpr
    | UnitExpr
    ;

//=====================================================================================================================

