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
export type BooleanLiteralExpr = Keyed & {
    readonly tag: '#BooleanLiteralExpr',
    readonly sourcePos: SourcePos,
    readonly value: boolean
}

//=====================================================================================================================

/**
 * Enumeration of built-in fundamental type names.
 */
export type BuiltInTypeExprTag =
    | '#BuiltInTypeBooleanExpr'
    | '#BuiltInTypeInt64Expr'
    | '#BuiltInTypeFloat64Expr'
    | '#BuiltInTypeStringExpr'

/**
 * A fundamental type name expression.
 */
export type BuiltInTypeExpr = Keyed & {
    readonly tag: BuiltInTypeExprTag,
    readonly sourcePos: SourcePos
}

//=====================================================================================================================

/**
 * Leading or trailing documentation.
 */
export type DocumentationExprTag =
    | '#LeadingDocumentationExpr'
    | '#TrailingDocumentationExpr'

/**
 * A leading or trailing documentation comment.
 */
export type DocumentationExpr = Keyed & {
    readonly tag: DocumentationExprTag,
    readonly sourcePos: SourcePos,
    readonly text: string
}

//=====================================================================================================================

/**
 * An empty expression, generally the inside of "()".
 */
export type EmptyExpr = Keyed & {
    readonly tag: '#EmptyExpr',
    readonly sourcePos: SourcePos
}

//=====================================================================================================================

/**
 * A single floating point literal.
 */
export type Float64LiteralExpr = Keyed & {
    readonly tag: '#Float64Expr',
    readonly sourcePos: SourcePos,
    readonly value: number
}

//=====================================================================================================================

/**
 * A single identifier.
 */
export type IdentifierExpr = Keyed & {
    readonly tag: '#IdentifierExpr',
    readonly sourcePos: SourcePos,
    readonly name: string
}

//=====================================================================================================================

/**
 * A single integer literal.
 */
export type Int64LiteralExpr = Keyed & {
    readonly tag: '#Int64LiteralExpr',
    readonly sourcePos: SourcePos,
    readonly value: number
}

//=====================================================================================================================

/**
 * Enumeration of operators linking a left hand side and a right hand side.
 */
export type BinaryOperationExprTag =
    | '#AdditionExpr'
    | '#DivisionExpr'
    | '#DocumentExpr'
    | '#EqualsExpr'
    | '#FieldReferenceExpr'
    | '#FunctionArrowExpr'
    | '#FunctionCallExpr'
    | '#GreaterThanExpr'
    | '#GreaterThanOrEqualsExpr'
    | '#InExpr'
    | '#IntersectExpr'
    | '#IntersectAssignValueExpr'
    | '#IntersectDefaultValueExpr'
    | '#IntersectLowPrecedenceExpr'
    | '#IsExpr'
    | '#LessThanExpr'
    | '#LessThanOrEqualsExpr'
    | '#LogicalAndExpr'
    | '#LogicalOrExpr'
    | '#MatchExpr'
    | '#MultiplicationExpr'
    | '#NotEqualsExpr'
    | '#NotMatchExpr'
    | '#QualificationExpr'
    | '#RangeExpr'
    | '#SubtractionExpr'
    | '#UnionExpr'
    | '#WhenExpr'
    | '#WhereExpr'

/**
 * Enumeration of expressions comprised of an arbitrary number of child expressions.
 */
export type CompositeExprTag =
    | '#ArrayLiteralExpr'
    | '#FunctionArgumentsExpr'
    | '#RecordExpr'

/**
 * Enumeration of operations with one operand (linked by the operands tree).
 */
export type UnaryOperationExprTag =
    | '#AnnotationExpr'
    | '#LogicalNotExpr'
    | '#NegationExpr'
    | '#OptionalExpr'
    | '#ParenthesizedExpr'
    | '#TagExpr'

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
export type OperationExpr = Keyed & {
    readonly tag: OperationExprTag,
    readonly sourcePos: SourcePos
}

//=====================================================================================================================

/**
 * String literals distinguished by start/stop delimiters.
 */
export type StringLiteralExprTag =
    | '#SingleQuotedStringExpr'
    | '#DoubleQuotedStringExpr'
    | '#BackTickedStringExpr'
    | '#SingleQuotedStringBlockExpr'
    | '#DoubleQuotedStringBlockExpr'
    | '#BackTickedStringBlockExpr'

/**
 * A single text literal.
 */
export type StringLiteralExpr = Keyed & {
    readonly tag: StringLiteralExprTag,
    readonly sourcePos: SourcePos,
    readonly value: string
}

//=====================================================================================================================

/**
 * Lligne AST expressions (including keys for acting as graph vertices).
 */
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

//=====================================================================================================================

