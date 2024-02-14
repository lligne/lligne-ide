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
 * A built-in fundamental type name expression.
 */
let builtInTypeExprTagObj = {
    '#BuiltInTypeBooleanExpr': true,
    '#BuiltInTypeInt64Expr': true,
    '#BuiltInTypeFloat64Expr': true,
    '#BuiltInTypeStringExpr': true
}

type BuiltInTypeExprTag = keyof typeof builtInTypeExprTagObj

let builtInTypeExprTagSet = new Set(Object.keys(builtInTypeExprTagObj))

export type BuiltInTypeExpr = Keyed & {
    readonly tag: BuiltInTypeExprTag,
    readonly sourcePos: SourcePos
}

export function isBuiltInTypeExpr(expr: Expr): expr is BuiltInTypeExpr {
    return builtInTypeExprTagSet.has(expr.tag)
}

//=====================================================================================================================

/**
 * Leading or trailing documentation.
 */
let documentationExprTagObj = {
    '#LeadingDocumentationExpr': true,
    '#TrailingDocumentationExpr': true
}

export type DocumentationExprTag = keyof typeof documentationExprTagObj

let documentationExprTagSet = new Set(Object.keys(documentationExprTagObj))

export type DocumentationExpr = Keyed & {
    readonly tag: DocumentationExprTag
    readonly sourcePos: SourcePos,
    readonly text: string
}

export function isDocumentationExpr(expr: Expr): expr is DocumentationExpr {
    return documentationExprTagSet.has(expr.tag)
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
    readonly tag: '#Float64LiteralExpr',
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
let binaryOperationExprTagObj = {
    '#AdditionExpr': true,
    '#DivisionExpr': true,
    '#DocumentExpr': true,
    '#EqualsExpr': true,
    '#FieldReferenceExpr': true,
    '#FunctionArrowExpr': true,
    '#FunctionCallExpr': true,
    '#GreaterThanExpr': true,
    '#GreaterThanOrEqualsExpr': true,
    '#InExpr': true,
    '#IntersectExpr': true,
    '#IntersectAssignValueExpr': true,
    '#IntersectDefaultValueExpr': true,
    '#IntersectLowPrecedenceExpr': true,
    '#IsExpr': true,
    '#LessThanExpr': true,
    '#LessThanOrEqualsExpr': true,
    '#LogicalAndExpr': true,
    '#LogicalOrExpr': true,
    '#MatchExpr': true,
    '#MultiplicationExpr': true,
    '#NotEqualsExpr': true,
    '#NotMatchExpr': true,
    '#QualificationExpr': true,
    '#RangeExpr': true,
    '#SubtractionExpr': true,
    '#UnionExpr': true,
    '#WhenExpr': true,
    '#WhereExpr': true,
}

export type BinaryOperationExprTag = keyof typeof binaryOperationExprTagObj

let binaryOperationExprTagSet = new Set(Object.keys(binaryOperationExprTagObj))

export type BinaryOperationExpr = Keyed & {
    readonly tag: BinaryOperationExprTag,
    readonly sourcePos: SourcePos
}

export function isBinaryOperationExpr(expr: Expr): expr is BinaryOperationExpr {
    return binaryOperationExprTagSet.has(expr.tag)
}

//=====================================================================================================================

/**
 * Enumeration of expressions comprised of an arbitrary number of child expressions.
 */
let sequenceExprTagObj = {
    '#ArrayLiteralExpr': true,
    '#FunctionArgumentsExpr': true,
    '#RecordExpr': true
}

export type SequenceExprTag = keyof typeof sequenceExprTagObj

let sequenceExprTagSet = new Set(Object.keys(sequenceExprTagObj))

export type SequenceExpr = Keyed & {
    readonly tag: SequenceExprTag,
    readonly sourcePos: SourcePos
}

export function isSequenceExpr(expr: Expr): expr is SequenceExpr {
    return sequenceExprTagSet.has(expr.tag)
}

//=====================================================================================================================

/**
 * Top level for a single source file.
 */
let sourceFileExprTagObj = {
    '#SourceFileExpr': true
}

export type SourceFileExprTag = keyof typeof sourceFileExprTagObj

let sourceFileExprTagSet = new Set(Object.keys(sourceFileExprTagObj))

export type SourceFileExpr = Keyed & {
    readonly tag: SourceFileExprTag,
    readonly sourcePos: SourcePos
}

export function isSourceFileExpr(expr: Expr): expr is SourceFileExpr {
    return sourceFileExprTagSet.has(expr.tag)
}

//=====================================================================================================================

/**
 * Top level for all source files in a compilation.
 */
let topLevelExprTagObj = {
    '#TopLevelExpr': true
}

export type TopLevelExprTag = keyof typeof topLevelExprTagObj

let topLevelExprTagSet = new Set(Object.keys(topLevelExprTagObj))

export type TopLevelExpr = Keyed & {
    readonly tag: TopLevelExprTag,
    readonly sourcePos: SourcePos
}

export function isTopLevelExpr(expr: Expr): expr is TopLevelExpr {
    return topLevelExprTagSet.has(expr.tag)
}

//=====================================================================================================================

/**
 * Enumeration of operations with one operand (linked by the operands tree).
 */
let unaryOperationExprTagObj = {
    '#AnnotationExpr': true,
    '#LogicalNotExpr': true,
    '#NegationExpr': true,
    '#OptionalExpr': true,
    '#ParenthesizedExpr': true,
    '#TagExpr': true,
}

export type UnaryOperationExprTag = keyof typeof unaryOperationExprTagObj

let unaryOperationExprTagSet = new Set(Object.keys(unaryOperationExprTagObj))

export type UnaryOperationExpr = Keyed & {
    readonly tag: UnaryOperationExprTag,
    readonly sourcePos: SourcePos
}

export function isUnaryOperationExpr(expr: Expr): expr is UnaryOperationExpr {
    return unaryOperationExprTagSet.has(expr.tag)
}

//=====================================================================================================================

/**
 * Combined enumeration of the above operation types.
 */
let compositeExprTagObj = {
    ...binaryOperationExprTagObj,
    ...sequenceExprTagObj,
    ...sourceFileExprTagObj,
    ...topLevelExprTagObj,
    ...unaryOperationExprTagObj
}

export type CompositeExprTag = keyof typeof compositeExprTagObj

let compositeExprTagSet = new Set(Object.keys(compositeExprTagObj))

export type CompositeExpr = Keyed & {
    readonly tag: CompositeExprTag,
    readonly sourcePos: SourcePos
}

export function isCompositeExpr(expr: Expr): expr is CompositeExpr {
    return compositeExprTagSet.has(expr.tag)
}

//=====================================================================================================================

/**
 * String literals distinguished by start/stop delimiters.
 */
let stringLiteralExprTagObj = {
    '#SingleQuotedStringExpr': true,
    '#DoubleQuotedStringExpr': true,
    '#BackTickedStringExpr': true,
    '#SingleQuotedStringBlockExpr': true,
    '#DoubleQuotedStringBlockExpr': true,
    '#BackTickedStringBlockExpr': true,
}

export type StringLiteralExprTag = keyof typeof stringLiteralExprTagObj

let stringLiteralExprTagSet = new Set(Object.keys(stringLiteralExprTagObj))

export type StringLiteralExpr = Keyed & {
    readonly tag: StringLiteralExprTag,
    readonly sourcePos: SourcePos,
    readonly value: string
}

export function isStringLiteralExpr(expr: Expr): expr is StringLiteralExpr {
    return stringLiteralExprTagSet.has(expr.tag)
}

//=====================================================================================================================

/**
 * Lligne AST expressions.
 */
export type Expr =
    | BooleanLiteralExpr
    | BuiltInTypeExpr
    | CompositeExpr
    | DocumentationExpr
    | EmptyExpr
    | Float64LiteralExpr
    | IdentifierExpr
    | Int64LiteralExpr
    | StringLiteralExpr

//=====================================================================================================================

