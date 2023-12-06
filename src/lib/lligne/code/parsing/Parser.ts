//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {Expr, OperationExpr} from "./Expressions"
import type {Outcome as PriorOutcome} from "../scanning/Scanner"
import type {Token} from "../scanning/Token"
import type {TokenType} from "../scanning/TokenType"
import {SourcePos} from "../util/SourcePos"
import {type Keyed} from "../../graphs/Keyed"
import {MutableTree, type Tree} from "../../graphs/Tree"
import {type OperationExprTag} from "./Expressions"

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
    readonly operands: Tree<Expr, {}>
}

//=====================================================================================================================

/**
 * Parses a top level expression from a scan result.
 * @param scanResult the tokens from the scanner.
 */
export function parseExpression(scanResult: PriorOutcome): Outcome {

    const operands = new MutableTree<Expr, {}>()

    const parser = new Parser(scanResult, operands)

    const model = parser.parseExprBindingPower(0)

    return {
        sourceCode: scanResult.SourceCode,
        newLineOffsets: scanResult.NewLineOffsets,
        model,
        operands: operands.freeze()
    }

}

//---------------------------------------------------------------------------------------------------------------------

// TODO: ParseTopLevel
// ParseParenthesizedItems parses a non-empty sequence of code expected to be the items within a record literal, e.g.
// the top level of a file.
//func ParseParenthesizedItems(sourceCode string, tokens []: Token) : Expr {
//	parser = newParser(sourceCode, tokens)
//
//	return parser.parseParenthesizedExpression(tokens[0], 'TokenType#Eof)
//}

//=====================================================================================================================

class Parser {
    private readonly operands: MutableTree<Expr, {}>
    private readonly sourceCode: string
    private readonly tokens: Token[]
    private tokensIndex: number

    constructor(scanResult: PriorOutcome, operands: MutableTree<Expr, {}>) {
        this.operands = operands
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
    ): Keyed & OperationExpr {
        const result: Keyed & OperationExpr = {
            key: Symbol(),
            tag,
            sourcePos
        }

        operands.forEach((operand) => {
            this.operands.join(result, operand, {})
        })

        return result
    }

    #parseArrayLiteral(token: Token): Expr {

        const startSourcePos = SourcePos.fromToken(token)
        const operands: Expr[] = []

        if (this.tokens[this.tokensIndex].tokenType == 'TokenType#RightBracket') {
            const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
            this.tokensIndex += 1
            return this.#makeOperationExpr(
                'Expr#ArrayLiteral',
                startSourcePos.thru(endSourcePos),
                operands
            )
        }

        while (this.tokens[this.tokensIndex].tokenType != 'TokenType#RightBracket') {
            // Parse one expression.
            operands.push(this.parseExprBindingPower(0))

            if (this.tokens[this.tokensIndex].tokenType != 'TokenType#Comma') {
                break
            }

            this.tokensIndex += 1
        }

        if (this.tokens[this.tokensIndex].tokenType != 'TokenType#RightBracket') {
            throw Error("Expected right bracket.")
        }

        const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
        this.tokensIndex += 1

        return this.#makeOperationExpr(
            'Expr#ArrayLiteral',
            startSourcePos.thru(endSourcePos),
            operands
        )

    }

    #parseFunctionArgumentsExpression(
        token: Token,
    ): Expr {

        const operands: Expr[] = []

        while (this.tokens[this.tokensIndex].tokenType != 'TokenType#RightParenthesis') {
            // Parse one expression.
            operands.push(this.parseExprBindingPower(0))

            if (this.tokens[this.tokensIndex].tokenType != 'TokenType#Comma') {
                break
            }
            this.tokensIndex += 1
        }

        if (this.tokens[this.tokensIndex].tokenType != 'TokenType#RightParenthesis') {
            throw Error("Expected right parenthesis.")
        }

        const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
        this.tokensIndex += 1

        return this.#makeOperationExpr(
            'Expr#FunctionArguments',
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

            case 'TokenType#BackTickedString':
                return {
                    key: Symbol(),
                    tag: 'Expr#BackTickedMultilineString',
                    sourcePos,
                    value: this.#getBackTickedStringValue(sourcePos)
                }

            case 'TokenType#Boolean':
                return {
                    key: Symbol(),
                    tag: 'Expr#Boolean',
                    sourcePos,
                }

            case 'TokenType#Dash':
                return this.#parseNegationOperationExpression(token)

            case 'TokenType#DoubleQuotedString':
                return {
                    key: Symbol(),
                    tag: 'Expr#DoubleQuotedString',
                    sourcePos,
                    value: this.#getQuotedStringValue(sourcePos)
                }

            case 'TokenType#False':
                return {
                    key: Symbol(),
                    tag: 'Expr#BooleanLiteral',
                    sourcePos,
                    value: false,
                }

            case 'TokenType#Float64':
                return {
                    key: Symbol(),
                    tag: 'Expr#Float64',
                    sourcePos,
                }

            case 'TokenType#FloatingPointLiteral':
                return {
                    key: Symbol(),
                    tag: 'Expr#Float64Literal',
                    sourcePos,
                    value: +sourcePos.getText(this.sourceCode),// TODO: better parsing
                }

            case 'TokenType#Identifier':
                return {
                    key: Symbol(),
                    tag: 'Expr#Identifier',
                    sourcePos,
                    name: sourcePos.getText(this.sourceCode)
                }

            case 'TokenType#Int64':
                return {
                    key: Symbol(),
                    tag: 'Expr#Int64',
                    sourcePos,
                }

            case 'TokenType#IntegerLiteral':
                return {
                    key: Symbol(),
                    tag: 'Expr#Int64Literal',
                    sourcePos,
                    value: +sourcePos.getText(this.sourceCode),// TODO: better parsing
                }

            case 'TokenType#LeadingDocumentation':
                return {
                    key: Symbol(),
                    tag: 'Expr#LeadingDocumentation',
                    sourcePos,
                    text: sourcePos.getText(this.sourceCode)
                }

            case 'TokenType#LeftBrace':
                return this.#parseRecordExpression(token)

            case 'TokenType#LeftBracket':
                return this.#parseArrayLiteral(token)

            case 'TokenType#LeftParenthesis':
                return this.#parseParenthesizedExpression(token)

            case 'TokenType#Not':
                return this.#parseLogicalNotOperationExpression(token)

            case 'TokenType#SingleQuotedString':
                return {
                    key: Symbol(),
                    tag: 'Expr#SingleQuotedString',
                    sourcePos: SourcePos.fromToken(token),
                    value: this.#getQuotedStringValue(sourcePos)
                }

            case 'TokenType#String':
                return {
                    key: Symbol(),
                    tag: 'Expr#String',
                    sourcePos: SourcePos.fromToken(token)
                }

            case 'TokenType#TrailingDocumentation':
                return {
                    key: Symbol(),
                    tag: 'Expr#TrailingDocumentation',
                    sourcePos,
                    text: sourcePos.getText(this.sourceCode)
                }

            case 'TokenType#True':
                return {
                    key: Symbol(),
                    tag: 'Expr#BooleanLiteral',
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

    #parseLogicalNotOperationExpression(
        token: Token,
    ): Expr {
        const rightBindingPower = prefixBindingPowers.get(token.tokenType)!
        const rhs = this.parseExprBindingPower(rightBindingPower)
        return this.#makeOperationExpr(
            'Expr#LogicalNot',
            SourcePos.fromToken(token),
            [rhs]
        )
    }

    #parseNegationOperationExpression(opToken: Token): Expr {
        const rightBindingPower = prefixBindingPowers.get(opToken.tokenType)!
        const rhs = this.parseExprBindingPower(rightBindingPower)
        return this.#makeOperationExpr(
            'Expr#Negation',
            SourcePos.fromToken(opToken).thru(rhs.sourcePos),
            [rhs]
        )
    }

    #parseParenthesizedExpression(
        token: Token,
    ): Expr {

        // Handle empty parentheses specially.
        if (this.tokens[this.tokensIndex].tokenType == 'TokenType#RightParenthesis') {
            const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
            this.tokensIndex += 1
            const sourcePos = SourcePos.fromToken(token).thru(endSourcePos)
            return this.#makeOperationExpr(
                'Expr#Parenthesized',
                sourcePos,
                [{key: Symbol(), tag: 'Expr#Empty', sourcePos}]
            )
        }

        // Parse the expression inside the parentheses
        const inner = this.parseExprBindingPower(0)

        if (this.tokens[this.tokensIndex].tokenType != 'TokenType#RightParenthesis') {
            throw Error("Expected " + 'TokenType#RightParenthesis')
        }

        const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
        this.tokensIndex += 1

        return this.#makeOperationExpr(
            'Expr#Parenthesized',
            SourcePos.fromToken(token).thru(endSourcePos),
            [inner]
        )

    }

    #parsePostfixExpression(lhs: Expr, opToken: Token): Expr {

        switch (opToken.tokenType) {

            case 'TokenType#LeftParenthesis':
                const rhs = this.#parseFunctionArgumentsExpression(opToken)
                return this.#makeOperationExpr(
                    'Expr#FunctionCall',
                    lhs.sourcePos.thru(rhs.sourcePos),
                    [lhs, rhs]
                )

            case 'TokenType#Question':
                return this.#makeOperationExpr(
                    'Expr#Optional',
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

        while (this.tokens[this.tokensIndex].tokenType != 'TokenType#RightBrace') {
            // Parse one expression.
            operands.push(this.parseExprBindingPower(0))

            if (this.tokens[this.tokensIndex].tokenType != 'TokenType#Comma') {
                break
            }

            this.tokensIndex += 1
        }

        if (this.tokens[this.tokensIndex].tokenType != 'TokenType#RightBrace') {
            throw Error("Expected right brace.")
        }

        const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
        this.tokensIndex += 1

        return this.#makeOperationExpr(
            'Expr#Record',
            SourcePos.fromToken(token).thru(endSourcePos),
            operands
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
    readonly exprTag: OperationExprTag
}

/** Binding power pairs for infix operators. */
const infixBindingPowers = new Map<TokenType, InfixBindingPower>()

/** Binding powers for prefix operators. */
const prefixBindingPowers = new Map<TokenType, number>()

/** Binding powers for postfix operators. */
const postfixBindingPowers = new Map<TokenType, number>()

let level = 1

infixBindingPowers.set('TokenType#Colon', {left: level, right: level + 1, exprTag: 'Expr#Qualification'})
infixBindingPowers.set('TokenType#Equals', {left: level, right: level + 1, exprTag: 'Expr#IntersectAssignValue'})
infixBindingPowers.set('TokenType#QuestionColon', {
    left: level,
    right: level + 1,
    exprTag: 'Expr#IntersectDefaultValue'
})

level += 2

infixBindingPowers.set('TokenType#AmpersandAmpersand', {
    left: level,
    right: level + 1,
    exprTag: 'Expr#IntersectLowPrecedence'
})

level += 2

infixBindingPowers.set('TokenType#VerticalBar', {left: level, right: level + 1, exprTag: 'Expr#Union'})

level += 2

infixBindingPowers.set('TokenType#Ampersand', {left: level, right: level + 1, exprTag: 'Expr#Intersect'})

level += 2

infixBindingPowers.set('TokenType#When', {left: level, right: level + 1, exprTag: 'Expr#When'})
infixBindingPowers.set('TokenType#Where', {left: level, right: level + 1, exprTag: 'Expr#Where'})

level += 2

infixBindingPowers.set('TokenType#SynthDocument', {left: level, right: level + 1, exprTag: 'Expr#Document'})

level += 2

infixBindingPowers.set('TokenType#Or', {left: level, right: level + 1, exprTag: 'Expr#LogicalOr'})

level += 2

infixBindingPowers.set('TokenType#And', {left: level, right: level + 1, exprTag: 'Expr#LogicalAnd'})

level += 2

prefixBindingPowers.set('TokenType#Not', level)

level += 2

infixBindingPowers.set('TokenType#EqualsEquals', {left: level, right: level + 1, exprTag: 'Expr#Equals'})
infixBindingPowers.set('TokenType#ExclamationEquals', {left: level, right: level + 1, exprTag: 'Expr#NotEquals'})
infixBindingPowers.set('TokenType#GreaterThan', {left: level, right: level + 1, exprTag: 'Expr#GreaterThan'})
infixBindingPowers.set('TokenType#GreaterThanOrEquals', {
    left: level,
    right: level + 1,
    exprTag: 'Expr#GreaterThanOrEquals'
})
infixBindingPowers.set('TokenType#LessThan', {left: level, right: level + 1, exprTag: 'Expr#LessThan'})
infixBindingPowers.set('TokenType#LessThanOrEquals', {
    left: level,
    right: level + 1,
    exprTag: 'Expr#LessThanOrEquals'
})

level += 2

infixBindingPowers.set('TokenType#In', {left: level, right: level + 1, exprTag: 'Expr#In'})
infixBindingPowers.set('TokenType#Is', {left: level, right: level + 1, exprTag: 'Expr#Is'})
infixBindingPowers.set('TokenType#EqualsTilde', {left: level, right: level + 1, exprTag: 'Expr#Match'})
infixBindingPowers.set('TokenType#ExclamationTilde', {left: level, right: level + 1, exprTag: 'Expr#NotMatch'})

level += 2

infixBindingPowers.set('TokenType#DotDot', {left: level, right: level + 1, exprTag: 'Expr#Range'})

level += 2

infixBindingPowers.set('TokenType#Dash', {left: level, right: level + 1, exprTag: 'Expr#Subtraction'})
infixBindingPowers.set('TokenType#Plus', {left: level, right: level + 1, exprTag: 'Expr#Addition'})

level += 2

infixBindingPowers.set('TokenType#Asterisk', {left: level, right: level + 1, exprTag: 'Expr#Multiplication'})
infixBindingPowers.set('TokenType#Slash', {left: level, right: level + 1, exprTag: "Expr#Division"})

level += 2

prefixBindingPowers.set('TokenType#Dash', level)

level += 2

infixBindingPowers.set('TokenType#RightArrow', {left: level, right: level + 1, exprTag: 'Expr#FunctionArrow'})

level += 2

infixBindingPowers.set('TokenType#Dot', {left: level, right: level + 1, exprTag: 'Expr#FieldReference'})

level += 2

postfixBindingPowers.set('TokenType#LeftParenthesis', level)
postfixBindingPowers.set('TokenType#LeftBracket', level)
postfixBindingPowers.set('TokenType#Question', level)

//=====================================================================================================================
