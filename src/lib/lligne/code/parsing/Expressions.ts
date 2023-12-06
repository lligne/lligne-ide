//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {SourcePos} from "../util/SourcePos"
import {type Keyed} from "../../graphs/Keyed"

//=====================================================================================================================

/**
 * A boolean literal expression.
 */
export type BooleanLiteralExpr = {
    readonly tag: 'Expr#BooleanLiteral',
    readonly sourcePos: SourcePos,
    readonly value: boolean
}

//=====================================================================================================================

/**
 * Enumeration of built-in fundamental type names.
 */
export type BuiltInTypeExprTag =
    | 'Expr#Boolean'
    | 'Expr#Int64'
    | 'Expr#Float64'
    | 'Expr#String'

/**
 * A fundamental type name expression.
 */
export type BuiltInTypeExpr = {
    readonly tag: BuiltInTypeExprTag,
    readonly sourcePos: SourcePos
}

//=====================================================================================================================

/**
 * Leading or trailing documentation.
 */
export type DocumentationExprTag =
    | 'Expr#LeadingDocumentation'
    | 'Expr#TrailingDocumentation'

/**
 * A leading or trailing documentation comment.
 */
export type DocumentationExpr = {
    readonly tag: DocumentationExprTag,
    readonly sourcePos: SourcePos,
    readonly text: string
}

//=====================================================================================================================

/**
 * An empty expression, generally the inside of "()".
 */
export type EmptyExpr = {
    readonly tag: 'Expr#Empty',
    readonly sourcePos: SourcePos
}

//=====================================================================================================================

/**
 * A single floating point literal.
 */
export type Float64LiteralExpr = {
    readonly tag: 'Expr#Float64Literal',
    readonly sourcePos: SourcePos,
    readonly value: number
}

//=====================================================================================================================

/**
 * A single identifier.
 */
export type IdentifierExpr = {
    readonly tag: 'Expr#Identifier',
    readonly sourcePos: SourcePos,
    readonly name: string
}

//=====================================================================================================================

/**
 * A single integer literal.
 */
export type Int64LiteralExpr = {
    readonly tag: 'Expr#Int64Literal',
    readonly sourcePos: SourcePos,
    readonly value: number
}

//=====================================================================================================================

/**
 * Enumeration of operators linking a left hand side and a right hand side.
 */
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

/**
 * Enumeration of expressions comprised of an arbitrary number of child expressions.
 */
export type CompositeExprTag =
    | 'Expr#ArrayLiteral'
    | 'Expr#FunctionArguments'
    | 'Expr#Record'

/**
 * Enumeration of operations with one operand (linked by the operands tree).
 */
export type UnaryOperationExprTag =
    | 'Expr#LogicalNot'
    | 'Expr#Negation'
    | 'Expr#Optional'
    | 'Expr#Parenthesized'

/**
 * Combined enumeration of the above operation types.
 */
export type OperationExprTag =
    | BinaryOperationExprTag
    | CompositeExprTag
    | UnaryOperationExprTag
    ;

/**
 * A generic operation involving one or more operands linked in a companion tree graph.
 */
export type OperationExpr = {
    readonly tag: OperationExprTag,
    readonly sourcePos: SourcePos
}

//=====================================================================================================================

/**
 * String literals distinguished by start/stop delimiters.
 */
export type StringLiteralExprTag =
    | 'Expr#SingleQuotedString'
    | 'Expr#DoubleQuotedString'
    | 'Expr#BackTickedString'
    | 'Expr#SingleQuotedMultilineString'
    | 'Expr#DoubleQuotedMultilineString'
    | 'Expr#BackTickedMultilineString'

/**
 * A single text literal.
 */
export type StringLiteralExpr = {
    readonly tag: StringLiteralExprTag,
    readonly sourcePos: SourcePos,
    readonly value: string
}

//=====================================================================================================================

/**
 * Lligne AST expressions (including keys for acting as graph vertices).
 */
export type Expr =
    Keyed & (
    | BooleanLiteralExpr
    | BuiltInTypeExpr
    | DocumentationExpr
    | EmptyExpr
    | Float64LiteralExpr
    | IdentifierExpr
    | Int64LiteralExpr
    | OperationExpr
    | StringLiteralExpr
    )

//=====================================================================================================================

