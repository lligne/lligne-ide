//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {BinaryOperationExprTag, Expr, OperationExpr, UnaryOperationExprTag} from "./Expressions"
import type {Outcome as PriorOutcome} from "../scanning/Scanner"
import type {Token} from "../scanning/Token"
import type {TokenType} from "../scanning/TokenType"
import {SourcePos} from "../util/SourcePos"
import {type OperationExprTag} from "./Expressions"
import {type CompositeTree, MutableCompositeTree} from "../../graphs/CompositeTree";

//=====================================================================================================================

/**
 * Edge properties for the operand relationship.
 */
export type Operand = {
    /** The order of an operand within its parent. */
    readonly index: number
}

//=====================================================================================================================

/**
 * The outcome of parsing.
 */
export type Outcome = {
    /** The original source code. */
    readonly sourceCode: string,

    /** Offsets of new line characters in the source code. */
    readonly newLineOffsets: number[],

    /** The root of the resulting AST. */
    readonly model: Expr,

    /** Tree structure defining the AST. */
    readonly _operation_operand_: CompositeTree<OperationExpr, Expr, Operand>
}

//=====================================================================================================================

/**
 * Parses a top level expression from a scan result.
 * @param scanResult the tokens from the scanner.
 */
export function parseExpression(scanResult: PriorOutcome): Outcome {

    const _operation_operand_ = new MutableCompositeTree<OperationExpr, Expr, Operand>()

    const parser = new Parser(scanResult, _operation_operand_)

    const model = parser.parseExprBindingPower(0)

    return {
        sourceCode: scanResult.SourceCode,
        newLineOffsets: scanResult.NewLineOffsets,
        model,
        _operation_operand_: _operation_operand_.freeze()
    }

}

//---------------------------------------------------------------------------------------------------------------------

// TODO: ParseTopLevel
// ParseParenthesizedItems parses a non-empty sequence of code expected to be the items within a record literal, e.g.
// the top level of a file.
//func ParseParenthesizedItems(sourceCode string, tokens []: Token) : Expr {
//	parser = newParser(sourceCode, tokens)
//
//	return parser.parseParenthesizedExpression(tokens[0], '#TokenTypeEof)
//}

//=====================================================================================================================

class Parser {
    private readonly _operation_operand_: MutableCompositeTree<OperationExpr, Expr, Operand>
    private readonly sourceCode: string
    private readonly tokens: Token[]
    private tokensIndex: number

    constructor(scanResult: PriorOutcome, operation_operand: MutableCompositeTree<OperationExpr, Expr, Operand>) {
        this._operation_operand_ = operation_operand
        this.sourceCode = scanResult.SourceCode
        this.tokens = scanResult.Tokens
        this.tokensIndex = 0
    }

    /**
     * Parses an expression, continuing until encountering an operation with binding power greater than the given value.
     * @param minBindingPower operations with binding power greater than this threshold signal the start of a larger
     *                        parent expression with the so-far parsed expression as its left hand side.
     */
    parseExprBindingPower(minBindingPower: number): Expr {

        let lhs = this.#parseLeftHandSide()

        while (true) {

            // Look ahead for an operator continuing the expression.
            const opToken = this.tokens[this.tokensIndex]

            // Handle postfix operators ...
            const pBindingPower = postfixBindingPowers.get(opToken.tokenType)!

            if (pBindingPower) {
                if (pBindingPower < minBindingPower) {
                    break
                }

                this.tokensIndex += 1
                lhs = this.#parsePostfixExpression(lhs, opToken)
                continue
            }

            // Handle infix operators ...
            const iBindingPower = infixBindingPowers.get(opToken.tokenType)!

            if (iBindingPower) {
                if (iBindingPower.left < minBindingPower) {
                    break
                }

                this.tokensIndex += 1
                lhs = this.#parseInfixOperation(lhs, iBindingPower)
                continue
            }

            break

        }

        return lhs
    }

    #getBackTickedStringValue(sourcePos: SourcePos) {
        const lines = sourcePos.getText(this.sourceCode).split('\n')
        let value = ""
        for (let line of lines) {
            value += line.substring(line.indexOf("`") + 1).trimEnd()
        }
        return value
    }

    #getQuotedStringValue(sourcePos: SourcePos) {
        let value = sourcePos.getText(this.sourceCode)
        value = value.substring(1, value.length - 1)
        // TODO: convert escape sequences
        return value
    }

    /**
     * Constructs an expression from given attributes and establishes its operands in the AST.
     * @param tag the type of expression.
     * @param sourcePos the source code range containing the expression
     * @param operands the operands of the expression
     * @private
     */
    #makeOperationExpr(
        tag: OperationExprTag,
        sourcePos: SourcePos,
        operands: Expr[]
    ): OperationExpr {
        const result: OperationExpr = {
            key: Symbol(),
            tag,
            sourcePos
        }

        operands.forEach((operand, index) => {
            this._operation_operand_.join(result, operand, {index})
        })

        return result
    }

    #parseArrayLiteral(token: Token): Expr {

        const startSourcePos = SourcePos.fromToken(token)
        const operands: Expr[] = []

        if (this.tokens[this.tokensIndex].tokenType == '#TokenTypeRightBracket') {
            const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
            this.tokensIndex += 1
            return this.#makeOperationExpr(
                '#ArrayLiteralExpr',
                startSourcePos.thru(endSourcePos),
                operands
            )
        }

        while (this.tokens[this.tokensIndex].tokenType != '#TokenTypeRightBracket') {
            // Parse one expression.
            operands.push(this.parseExprBindingPower(0))

            if (this.tokens[this.tokensIndex].tokenType != '#TokenTypeComma') {
                break
            }

            this.tokensIndex += 1
        }

        if (this.tokens[this.tokensIndex].tokenType != '#TokenTypeRightBracket') {
            throw Error("Expected right bracket.")
        }

        const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
        this.tokensIndex += 1

        return this.#makeOperationExpr(
            '#ArrayLiteralExpr',
            startSourcePos.thru(endSourcePos),
            operands
        )

    }

    #parseFunctionArgumentsExpression(
        token: Token,
    ): Expr {

        const operands: Expr[] = []

        while (this.tokens[this.tokensIndex].tokenType != '#TokenTypeRightParenthesis') {
            // Parse one expression.
            operands.push(this.parseExprBindingPower(0))

            if (this.tokens[this.tokensIndex].tokenType != '#TokenTypeComma') {
                break
            }
            this.tokensIndex += 1
        }

        if (this.tokens[this.tokensIndex].tokenType != '#TokenTypeRightParenthesis') {
            throw Error("Expected right parenthesis.")
        }

        const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
        this.tokensIndex += 1

        return this.#makeOperationExpr(
            '#FunctionArgumentsExpr',
            SourcePos.fromToken(token).thru(endSourcePos),
            operands
        )

    }

    /**
     * Parses an infix expression after the left hand side and the operator token have been consumed.
     */
    #parseInfixOperation(
        lhs: Expr,
        bindingPower: InfixBindingPower
    ): Expr {
        const rhs = this.parseExprBindingPower(bindingPower.right)
        const sourcePos = lhs.sourcePos.thru(rhs.sourcePos)

        return this.#makeOperationExpr(bindingPower.exprTag, sourcePos, [lhs, rhs])
    }

    #parseLeftHandSide(): Expr {

        const token = this.tokens[this.tokensIndex]
        this.tokensIndex += 1

        const sourcePos = SourcePos.fromToken(token)

        switch (token.tokenType) {

            case '#TokenTypeAtSign':
            case '#TokenTypeDash':
            case '#TokenTypeHash':
            case '#TokenTypeNot':
                return this.#parseUnaryOperationExpression(token)

            case '#TokenTypeBackTickedString':
                return {
                    key: Symbol(),
                    tag: '#BackTickedStringBlockExpr',
                    sourcePos,
                    value: this.#getBackTickedStringValue(sourcePos)
                }

            case '#TokenTypeBoolean':
                return {
                    key: Symbol(),
                    tag: '#BuiltInTypeBooleanExpr',
                    sourcePos,
                }

            case '#TokenTypeDoubleQuotedString':
                return {
                    key: Symbol(),
                    tag: '#DoubleQuotedStringExpr',
                    sourcePos,
                    value: this.#getQuotedStringValue(sourcePos)
                }

            case '#TokenTypeFalse':
                return {
                    key: Symbol(),
                    tag: '#BooleanLiteralExpr',
                    sourcePos,
                    value: false,
                }

            case '#TokenTypeFloat64':
                return {
                    key: Symbol(),
                    tag: '#BuiltInTypeFloat64Expr',
                    sourcePos,
                }

            case '#TokenTypeFloatingPointLiteral':
                return {
                    key: Symbol(),
                    tag: '#Float64Expr',
                    sourcePos,
                    value: +sourcePos.getText(this.sourceCode),// TODO: better parsing
                }

            case '#TokenTypeIdentifier':
                return {
                    key: Symbol(),
                    tag: '#IdentifierExpr',
                    sourcePos,
                    name: sourcePos.getText(this.sourceCode)
                }

            case '#TokenTypeInt64':
                return {
                    key: Symbol(),
                    tag: '#BuiltInTypeInt64Expr',
                    sourcePos,
                }

            case '#TokenTypeIntegerLiteral':
                return {
                    key: Symbol(),
                    tag: '#Int64LiteralExpr',
                    sourcePos,
                    value: +sourcePos.getText(this.sourceCode),// TODO: better parsing
                }

            case '#TokenTypeLeadingDocumentation':
                return {
                    key: Symbol(),
                    tag: '#LeadingDocumentationExpr',
                    sourcePos,
                    text: sourcePos.getText(this.sourceCode)
                }

            case '#TokenTypeLeftBrace':
                return this.#parseRecordExpression(token)

            case '#TokenTypeLeftBracket':
                return this.#parseArrayLiteral(token)

            case '#TokenTypeLeftParenthesis':
                return this.#parseParenthesizedExpression(token)

            case '#TokenTypeSingleQuotedString':
                return {
                    key: Symbol(),
                    tag: '#SingleQuotedStringExpr',
                    sourcePos: SourcePos.fromToken(token),
                    value: this.#getQuotedStringValue(sourcePos)
                }

            case '#TokenTypeString':
                return {
                    key: Symbol(),
                    tag: '#BuiltInTypeStringExpr',
                    sourcePos: SourcePos.fromToken(token)
                }

            case '#TokenTypeTrailingDocumentation':
                return {
                    key: Symbol(),
                    tag: '#TrailingDocumentationExpr',
                    sourcePos,
                    text: sourcePos.getText(this.sourceCode)
                }

            case '#TokenTypeTrue':
                return {
                    key: Symbol(),
                    tag: '#BooleanLiteralExpr',
                    sourcePos,
                    value: true,
                }

            //	default:
            //	this.expectedType(
            //	LlaceTokenType.CHAR_LITERAL,
            //	LlaceTokenType.DASH,
            //	LlaceTokenType.IDENTIFIER,
            //	LlaceTokenType.INTEGER_LITERAL,
            //	LlaceTokenType.STRING_LITERAL
            //	)

        }

        throw Error("Unfinished parsing code: '" + token.tokenType + "'.")

    }

    #parseParenthesizedExpression(
        token: Token,
    ): Expr {

        // Handle empty parentheses specially.
        if (this.tokens[this.tokensIndex].tokenType == '#TokenTypeRightParenthesis') {
            const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
            this.tokensIndex += 1
            const sourcePos = SourcePos.fromToken(token).thru(endSourcePos)
            return this.#makeOperationExpr(
                '#ParenthesizedExpr',
                sourcePos,
                [{key: Symbol(), tag: '#EmptyExpr', sourcePos}]
            )
        }

        // Parse the expression inside the parentheses
        const inner = this.parseExprBindingPower(0)

        if (this.tokens[this.tokensIndex].tokenType != '#TokenTypeRightParenthesis') {
            throw Error("Expected " + '#TokenTypeRightParenthesis')
        }

        const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
        this.tokensIndex += 1

        return this.#makeOperationExpr(
            '#ParenthesizedExpr',
            SourcePos.fromToken(token).thru(endSourcePos),
            [inner]
        )

    }

    #parsePostfixExpression(lhs: Expr, opToken: Token): Expr {

        switch (opToken.tokenType) {

            case '#TokenTypeLeftParenthesis':
                const rhs = this.#parseFunctionArgumentsExpression(opToken)
                return this.#makeOperationExpr(
                    '#FunctionCallExpr',
                    lhs.sourcePos.thru(rhs.sourcePos),
                    [lhs, rhs]
                )

            case '#TokenTypeQuestion':
                return this.#makeOperationExpr(
                    '#OptionalExpr',
                    lhs.sourcePos,
                    [lhs]
                )

        }

        throw Error("Unfinished postfix parsing code: '" + opToken.tokenType + "'.")

    }

    #parseRecordExpression(
        token: Token,
    ): Expr {

        const operands: Expr[] = []

        while (this.tokens[this.tokensIndex].tokenType != '#TokenTypeRightBrace') {
            // Parse one expression.
            operands.push(this.parseExprBindingPower(0))

            if (this.tokens[this.tokensIndex].tokenType != '#TokenTypeComma') {
                break
            }

            this.tokensIndex += 1
        }

        if (this.tokens[this.tokensIndex].tokenType != '#TokenTypeRightBrace') {
            throw Error("Expected right brace.")
        }

        const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
        this.tokensIndex += 1

        return this.#makeOperationExpr(
            '#RecordExpr',
            SourcePos.fromToken(token).thru(endSourcePos),
            operands
        )

    }

    #parseUnaryOperationExpression(
        token: Token
    ): Expr {
        const bindingPower = prefixBindingPowers.get(token.tokenType)!
        const rhs = this.parseExprBindingPower(bindingPower.right)
        return this.#makeOperationExpr(
            bindingPower.exprTag,
            SourcePos.fromToken(token),
            [rhs]
        )
    }

}

//=====================================================================================================================

/**
 * Captures the left binding power, right binding power, and corresponding expression tag for a given infix operator.
 */
type InfixBindingPower = {
    readonly left: number
    readonly right: number
    readonly exprTag: BinaryOperationExprTag
}

/**
 * Captures the right binding power and corresponding expression tag for a given prefix operator.
 */
type PrefixBindingPower = {
    readonly right: number
    readonly exprTag: UnaryOperationExprTag
}

/** Binding power pairs for infix operators. */
const infixBindingPowers = new Map<TokenType, InfixBindingPower>()

/** Binding powers for prefix operators. */
const prefixBindingPowers = new Map<TokenType, PrefixBindingPower>()

/** Binding powers for postfix operators. */
const postfixBindingPowers = new Map<TokenType, number>()

let level = 1

infixBindingPowers.set('#TokenTypeColon', {left: level, right: level + 1, exprTag: '#QualificationExpr'})
infixBindingPowers.set('#TokenTypeEquals', {left: level, right: level + 1, exprTag: '#IntersectAssignValueExpr'})
infixBindingPowers.set('#TokenTypeQuestionColon', {
    left: level,
    right: level + 1,
    exprTag: '#IntersectDefaultValueExpr'
})

level += 2

infixBindingPowers.set('#TokenTypeAmpersandAmpersand', {
    left: level,
    right: level + 1,
    exprTag: '#IntersectLowPrecedenceExpr'
})

level += 2

infixBindingPowers.set('#TokenTypeVerticalBar', {left: level, right: level + 1, exprTag: '#UnionExpr'})

level += 2

infixBindingPowers.set('#TokenTypeAmpersand', {left: level, right: level + 1, exprTag: '#IntersectExpr'})

level += 2

infixBindingPowers.set('#TokenTypeWhen', {left: level, right: level + 1, exprTag: '#WhenExpr'})
infixBindingPowers.set('#TokenTypeWhere', {left: level, right: level + 1, exprTag: '#WhereExpr'})

level += 2

infixBindingPowers.set('#TokenTypeSynthDocument', {left: level, right: level + 1, exprTag: '#DocumentExpr'})

level += 2

infixBindingPowers.set('#TokenTypeOr', {left: level, right: level + 1, exprTag: '#LogicalOrExpr'})

level += 2

infixBindingPowers.set('#TokenTypeAnd', {left: level, right: level + 1, exprTag: '#LogicalAndExpr'})

level += 2

prefixBindingPowers.set('#TokenTypeNot', {right: level, exprTag: '#LogicalNotExpr'})

level += 2

infixBindingPowers.set('#TokenTypeEqualsEquals', {left: level, right: level + 1, exprTag: '#EqualsExpr'})
infixBindingPowers.set('#TokenTypeExclamationEquals', {left: level, right: level + 1, exprTag: '#NotEqualsExpr'})
infixBindingPowers.set('#TokenTypeGreaterThan', {left: level, right: level + 1, exprTag: '#GreaterThanExpr'})
infixBindingPowers.set('#TokenTypeGreaterThanOrEquals', {
    left: level,
    right: level + 1,
    exprTag: '#GreaterThanOrEqualsExpr'
})
infixBindingPowers.set('#TokenTypeLessThan', {left: level, right: level + 1, exprTag: '#LessThanExpr'})
infixBindingPowers.set('#TokenTypeLessThanOrEquals', {
    left: level,
    right: level + 1,
    exprTag: '#LessThanOrEqualsExpr'
})

level += 2

infixBindingPowers.set('#TokenTypeIn', {left: level, right: level + 1, exprTag: '#InExpr'})
infixBindingPowers.set('#TokenTypeIs', {left: level, right: level + 1, exprTag: '#IsExpr'})
infixBindingPowers.set('#TokenTypeEqualsTilde', {left: level, right: level + 1, exprTag: '#MatchExpr'})
infixBindingPowers.set('#TokenTypeExclamationTilde', {left: level, right: level + 1, exprTag: '#NotMatchExpr'})

level += 2

infixBindingPowers.set('#TokenTypeDotDot', {left: level, right: level + 1, exprTag: '#RangeExpr'})

level += 2

infixBindingPowers.set('#TokenTypeDash', {left: level, right: level + 1, exprTag: '#SubtractionExpr'})
infixBindingPowers.set('#TokenTypePlus', {left: level, right: level + 1, exprTag: '#AdditionExpr'})

level += 2

infixBindingPowers.set('#TokenTypeAsterisk', {left: level, right: level + 1, exprTag: '#MultiplicationExpr'})
infixBindingPowers.set('#TokenTypeSlash', {left: level, right: level + 1, exprTag: '#DivisionExpr'})

level += 2

prefixBindingPowers.set('#TokenTypeDash', {right: level, exprTag: '#NegationExpr'})

level += 2

infixBindingPowers.set('#TokenTypeRightArrow', {left: level, right: level + 1, exprTag: '#FunctionArrowExpr'})

level += 2

prefixBindingPowers.set('#TokenTypeAtSign', {right: level, exprTag: '#AnnotationExpr'})

level += 2

infixBindingPowers.set('#TokenTypeDot', {left: level, right: level + 1, exprTag: '#FieldReferenceExpr'})

level += 2

prefixBindingPowers.set('#TokenTypeHash', {right: level, exprTag: '#TagExpr'})

level += 2

postfixBindingPowers.set('#TokenTypeLeftParenthesis', level)
postfixBindingPowers.set('#TokenTypeLeftBracket', level)
postfixBindingPowers.set('#TokenTypeQuestion', level)

//=====================================================================================================================
