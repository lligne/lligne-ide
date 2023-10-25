//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {Expr} from "./Expressions";
import type {Outcome as PriorOutcome} from "../scanning/Scanner"
import type {Token} from "../scanning/Token";
import type {TokenType} from "../scanning/TokenType";
import {SourcePos} from "../util/SourcePos";

//=====================================================================================================================

export type Outcome = {
    SourceCode: string,
    NewLineOffsets: number[],
    Model: Expr
}

//=====================================================================================================================

export function ParseExpression(scanResult: PriorOutcome): Outcome {
    const parser = new Parser(scanResult)

    const model = parser.parseExprBindingPower(0)

    return {
        SourceCode: scanResult.SourceCode,
        NewLineOffsets: scanResult.NewLineOffsets,
        Model: model,
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
    readonly tokens: Token[]
    private index: number
    readonly sourceCode: string

    constructor(scanResult: PriorOutcome) {
        this.sourceCode = scanResult.SourceCode
        this.tokens = scanResult.Tokens
        this.index = 0
    }

    parseExprBindingPower(minBindingPower: number): Expr {

        let lhs = this.#parseLeftHandSide()

        while (true) {

            // Look ahead for an operator continuing the expression
            const opToken = this.tokens[this.index]

            // Handle postfix operators ...
            const pBindingPower = postfixBindingPowers.get(opToken.tokenType)!

            if (pBindingPower) {

                if (pBindingPower < minBindingPower) {
                    break
                }

                this.index += 1

                lhs = this.#parsePostfixExpression(opToken, lhs)

                continue

            }

            // Handle infix operators ...
            const bindingPower = infixBindingPowers.get(opToken.tokenType)!

            if (bindingPower) {

                if (bindingPower.left < minBindingPower) {
                    break
                }

                this.index += 1

                lhs = this.#parseInfixOperation(opToken, bindingPower, lhs)

                continue

            }

            break

        }

        return lhs
    }

    #getQuotedStringValue(sourcePos: SourcePos) {
        let value = sourcePos.GetText(this.sourceCode)
        value = value.substring(1, value.length - 1)
        // TODO: convert escape sequences
        return value
    }

    #parseArrayLiteral(token: Token): Expr {

        const startSourcePos = SourcePos.fromToken(token)
        const items: Expr[] = []

        if (this.tokens[this.index].tokenType == 'TokenType#RightBracket') {
            const endSourcePos = SourcePos.fromToken(this.tokens[this.index])
            this.index += 1
            return {
                tag: 'Expr#ArrayLiteral',
                sourcePos: startSourcePos.Thru(endSourcePos),
                items
            }
        }

        while (this.tokens[this.index].tokenType != 'TokenType#RightBracket') {
            // Parse one expression.
            items.push(this.parseExprBindingPower(0))

            if (this.tokens[this.index].tokenType != 'TokenType#Comma') {
                break
            }
            this.index += 1
        }

        if (this.tokens[this.index].tokenType != 'TokenType#RightBracket') {
            throw Error("Expected right bracket.")
        }
        const endSourcePos = SourcePos.fromToken(this.tokens[this.index])
        this.index += 1

        return {
            tag: 'Expr#ArrayLiteral',
            sourcePos: startSourcePos.Thru(endSourcePos),
            items
        }

    }

    #parseFunctionArgumentsExpression(
        token: Token,
    ): Expr {

        var items: Expr[] = []

        while (this.tokens[this.index].tokenType != 'TokenType#RightParenthesis') {
            // Parse one expression.
            items.push(this.parseExprBindingPower(0))

            if (this.tokens[this.index].tokenType != 'TokenType#Comma') {
                break
            }
            this.index += 1
        }

        if (this.tokens[this.index].tokenType != 'TokenType#RightParenthesis') {
            throw Error("Expected right parenthesis.")
        }
        const endSourcePos = SourcePos.fromToken(this.tokens[this.index])
        this.index += 1

        return {
            tag: 'Expr#FunctionArguments',
            sourcePos: SourcePos.fromToken(token).Thru(endSourcePos),
            items
        }

    }

    // Parses an infix expression after the left hand side and the operator token have been consumed
    #parseInfixOperation(
        opToken: Token,
        bindingPower: InfixBindingPower,
        lhs: Expr
    ): Expr {
        const rhs = this.parseExprBindingPower(bindingPower.right)
        const sourcePos = lhs.sourcePos.Thru(rhs.sourcePos)

        switch (opToken.tokenType) {

            case 'TokenType#Ampersand':
                return {tag: 'Expr#Intersect', sourcePos, lhs, rhs}
            case 'TokenType#AmpersandAmpersand':
                return {tag: 'Expr#IntersectLowPrecedence', sourcePos, lhs, rhs}
            case 'TokenType#And':
                return {tag: 'Expr#LogicalAnd', sourcePos, lhs, rhs}
            case 'TokenType#Asterisk':
                return {tag: 'Expr#Multiplication', sourcePos, lhs, rhs}
            case 'TokenType#Colon':
                return {tag: 'Expr#Qualification', sourcePos, lhs, rhs}
            case 'TokenType#Dash':
                return {tag: 'Expr#Subtraction', sourcePos, lhs, rhs}
            case 'TokenType#Dot':
                return {tag: 'Expr#FieldReference', sourcePos, lhs, rhs}
            case 'TokenType#DotDot':
                return {tag: 'Expr#Range', sourcePos, lhs, rhs}
            case 'TokenType#Equals':
                return {tag: 'Expr#IntersectAssignValue', sourcePos, lhs, rhs}
            case 'TokenType#EqualsEquals':
                return {tag: 'Expr#Equals', sourcePos, lhs, rhs}
            case 'TokenType#EqualsTilde':
                return {tag: 'Expr#Match', sourcePos, lhs, rhs}
            case 'TokenType#ExclamationEquals':
                return {tag: 'Expr#NotEquals', sourcePos, lhs, rhs}
            case 'TokenType#ExclamationTilde':
                return {tag: 'Expr#NotMatch', sourcePos, lhs, rhs}
            case 'TokenType#GreaterThan':
                return {tag: 'Expr#GreaterThan', sourcePos, lhs, rhs}
            case 'TokenType#GreaterThanOrEquals':
                return {tag: 'Expr#GreaterThanOrEquals', sourcePos, lhs, rhs}
            case 'TokenType#In':
                return {tag: 'Expr#In', sourcePos, lhs, rhs}
            case 'TokenType#Is':
                return {tag: 'Expr#Is', sourcePos, lhs, rhs}
            case 'TokenType#LessThan':
                return {tag: 'Expr#LessThan', sourcePos, lhs, rhs}
            case 'TokenType#LessThanOrEquals':
                return {tag: 'Expr#LessThanOrEquals', sourcePos, lhs, rhs}
            case 'TokenType#Or':
                return {tag: 'Expr#LogicalOr', sourcePos, lhs, rhs}
            case 'TokenType#Plus':
                return {tag: 'Expr#Addition', sourcePos, lhs, rhs}
            case 'TokenType#QuestionColon':
                return {tag: 'Expr#IntersectDefaultValue', sourcePos, lhs, rhs}
            case 'TokenType#RightArrow':
                return {tag: 'Expr#FunctionArrow', sourcePos, lhs, rhs}
            case 'TokenType#Slash':
                return {tag: 'Expr#Division', sourcePos, lhs, rhs}
            case 'TokenType#SynthDocument':
                return {tag: 'Expr#Document', sourcePos, lhs, rhs}
            case 'TokenType#VerticalBar':
                return {tag: 'Expr#Union', sourcePos, lhs, rhs}
            case 'TokenType#When':
                return {tag: 'Expr#When', sourcePos, lhs, rhs}
            case 'TokenType#Where':
                return {tag: 'Expr#Where', sourcePos, lhs, rhs}
            default:
                throw Error("Missing case in parseInfixOperation: " + opToken.tokenType + "'.")

        }

    }

    #parseLeftHandSide(): Expr {

        const token = this.tokens[this.index]
        this.index += 1

        const sourcePos = SourcePos.fromToken(token)

        switch (token.tokenType) {

            case 'TokenType#BackTickedString':
                return {
                    tag: 'Expr#BackTickedMultilineString',
                    sourcePos,
                    value: "TBD"
                }

            case 'TokenType#Boolean':
                return {
                    tag: 'Expr#Boolean',
                    sourcePos,
                }

            case 'TokenType#Dash':
                return this.#parseNegationOperationExpression(token)

            case 'TokenType#DoubleQuotedString':
                return {
                    tag: 'Expr#DoubleQuotedString',
                    sourcePos,
                    value: this.#getQuotedStringValue(sourcePos)
                }

            case 'TokenType#False':
                return {
                    tag: 'Expr#BooleanLiteral',
                    sourcePos,
                    value: false,
                }

            case 'TokenType#Float64':
                return {
                    tag: 'Expr#Float64',
                    sourcePos,
                }

            case 'TokenType#FloatingPointLiteral':
                return {
                    tag: 'Expr#Float64Literal',
                    sourcePos,
                    value: +sourcePos.GetText(this.sourceCode),// TODO: better parsing
                }

            case 'TokenType#Identifier':
                return {
                    tag: 'Expr#Identifier',
                    sourcePos,
                    text: sourcePos.GetText(this.sourceCode)
                }

            case 'TokenType#Int64':
                return {
                    tag: 'Expr#Int64',
                    sourcePos,
                }

            case 'TokenType#IntegerLiteral':
                return {
                    tag: 'Expr#Int64Literal',
                    sourcePos,
                    value: +sourcePos.GetText(this.sourceCode),// TODO: better parsing
                }

            case 'TokenType#LeadingDocumentation':
                return {
                    tag: 'Expr#LeadingDocumentation',
                    sourcePos,
                    text: sourcePos.GetText(this.sourceCode)
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
                    tag: 'Expr#SingleQuotedString',
                    sourcePos: SourcePos.fromToken(token),
                    value: this.#getQuotedStringValue(sourcePos)
                }

            case 'TokenType#String':
                return {
                    tag: 'Expr#String',
                    sourcePos: SourcePos.fromToken(token)
                }

            case 'TokenType#TrailingDocumentation':
                return {
                    tag: 'Expr#TrailingDocumentation',
                    sourcePos,
                    text: sourcePos.GetText(this.sourceCode)
                }

            case 'TokenType#True':
                return {
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
        return {
            tag: 'Expr#LogicalNot',
            sourcePos: SourcePos.fromToken(token),
            operand: rhs,
        }
    }

    #parseNegationOperationExpression(opToken: Token): Expr {
        const rightBindingPower = prefixBindingPowers.get(opToken.tokenType)!
        const rhs = this.parseExprBindingPower(rightBindingPower)
        return {
            tag: 'Expr#Negation',
            sourcePos: SourcePos.fromToken(opToken).Thru(rhs.sourcePos),
            operand: rhs,
        }
    }

    #parseParenthesizedExpression(
        token: Token,
    ): Expr {

        // Handle empty parentheses specially.
        if (this.tokens[this.index].tokenType == 'TokenType#RightParenthesis') {
            const endSourcePos = SourcePos.fromToken(this.tokens[this.index])
            this.index += 1
            const sourcePos = SourcePos.fromToken(token).Thru(endSourcePos)
            return {
                tag: 'Expr#Parenthesized',
                sourcePos,
                operand: {tag: 'Expr#Unit', sourcePos}
            }
        }

        // Parse one expression.
        const inner = this.parseExprBindingPower(0)

        // Comma means function parameters
        if (this.tokens[this.index].tokenType == 'TokenType#Comma') {

            this.index += 1

            const items: Expr[] = []
            items.push(inner)

            while (this.tokens[this.index].tokenType != 'TokenType#RightParenthesis') {
                // Parse one expression.
                items.push(this.parseExprBindingPower(0))

                if (this.tokens[this.index].tokenType != 'TokenType#Comma') {
                    break
                }
                this.index += 1
            }

            if (this.tokens[this.index].tokenType != 'TokenType#RightParenthesis') {
                throw Error("Expected right parenthesis.")
            }
            const endSourcePos = SourcePos.fromToken(this.tokens[this.index])
            this.index += 1

            return {
                tag: 'Expr#FunctionArguments',
                sourcePos: SourcePos.fromToken(token).Thru(endSourcePos),
                items
            }

        }

        if (this.tokens[this.index].tokenType != 'TokenType#RightParenthesis') {
            throw Error("Expected " + 'TokenType#RightParenthesis')
        }

        const endSourcePos = SourcePos.fromToken(this.tokens[this.index])
        this.index += 1

        return {
            tag: 'Expr#Parenthesized',
            sourcePos: SourcePos.fromToken(token).Thru(endSourcePos),
            operand: inner,
        }

    }

    #parsePostfixExpression(opToken: Token, lhs: Expr): Expr {

        switch (opToken.tokenType) {

            case 'TokenType#LeftParenthesis':
                const rhs = this.#parseFunctionArgumentsExpression(opToken)
                return {
                    tag: 'Expr#FunctionCall',
                    sourcePos: lhs.sourcePos.Thru(rhs.sourcePos),
                    lhs,
                    rhs
                }

            case 'TokenType#Question':
                return {
                    tag: 'Expr#Optional',
                    sourcePos: lhs.sourcePos,
                    operand: lhs,
                }

        }

        throw Error("Unfinished postfix parsing code: '" + opToken.tokenType + "'.")

    }

    #parseRecordExpression(
        token: Token,
    ): Expr {

        const items: Expr[] = []

        while (this.tokens[this.index].tokenType != 'TokenType#RightBrace') {
            // Parse one expression.
            items.push(this.parseExprBindingPower(0))

            if (this.tokens[this.index].tokenType != 'TokenType#Comma') {
                break
            }
            this.index += 1
        }

        if (this.tokens[this.index].tokenType != 'TokenType#RightBrace') {
            throw Error("Expected right brace.")
        }
        const endSourcePos = SourcePos.fromToken(this.tokens[this.index])
        this.index += 1

        return {
            tag: 'Expr#Record',
            sourcePos: SourcePos.fromToken(token).Thru(endSourcePos),
            items: items,
        }

    }


}

//=====================================================================================================================

type InfixBindingPower = {
    left: number
    right: number
}

/** Binding power pairs for infix operators. */
const infixBindingPowers = new Map<TokenType, InfixBindingPower>();

/** Binding powers for prefix operators. */
const prefixBindingPowers = new Map<TokenType, number>();

/** Binding powers for postfix operators. */
const postfixBindingPowers = new Map<TokenType, number>();

(function init() {

    let level = 1

    infixBindingPowers.set('TokenType#Colon', {left: level, right: level + 1})
    infixBindingPowers.set('TokenType#Equals', {left: level, right: level + 1})
    infixBindingPowers.set('TokenType#QuestionColon', {left: level, right: level + 1})

    level += 2

    infixBindingPowers.set('TokenType#AmpersandAmpersand', {left: level, right: level + 1})

    level += 2

    infixBindingPowers.set('TokenType#VerticalBar', {left: level, right: level + 1})

    level += 2

    infixBindingPowers.set('TokenType#Ampersand', {left: level, right: level + 1})

    level += 2

    infixBindingPowers.set('TokenType#When', {left: level, right: level + 1})
    infixBindingPowers.set('TokenType#Where', {left: level, right: level + 1})

    level += 2

    infixBindingPowers.set('TokenType#SynthDocument', {left: level, right: level + 1})

    level += 2

    infixBindingPowers.set('TokenType#Or', {left: level, right: level + 1})

    level += 2

    infixBindingPowers.set('TokenType#And', {left: level, right: level + 1})

    level += 2

    prefixBindingPowers.set('TokenType#Not', level)

    level += 2

    infixBindingPowers.set('TokenType#EqualsEquals', {left: level, right: level + 1})
    infixBindingPowers.set('TokenType#ExclamationEquals', {left: level, right: level + 1})
    infixBindingPowers.set('TokenType#GreaterThan', {left: level, right: level + 1})
    infixBindingPowers.set('TokenType#GreaterThanOrEquals', {left: level, right: level + 1})
    infixBindingPowers.set('TokenType#LessThan', {left: level, right: level + 1})
    infixBindingPowers.set('TokenType#LessThanOrEquals', {left: level, right: level + 1})

    level += 2

    infixBindingPowers.set('TokenType#In', {left: level, right: level + 1})
    infixBindingPowers.set('TokenType#Is', {left: level, right: level + 1})
    infixBindingPowers.set('TokenType#EqualsTilde', {left: level, right: level + 1})
    infixBindingPowers.set('TokenType#ExclamationTilde', {left: level, right: level + 1})

    level += 2

    infixBindingPowers.set('TokenType#DotDot', {left: level, right: level + 1})

    level += 2

    infixBindingPowers.set('TokenType#Dash', {left: level, right: level + 1})
    infixBindingPowers.set('TokenType#Plus', {left: level, right: level + 1})

    level += 2

    infixBindingPowers.set('TokenType#Asterisk', {left: level, right: level + 1})
    infixBindingPowers.set('TokenType#Slash', {left: level, right: level + 1})

    level += 2

    prefixBindingPowers.set('TokenType#Dash', level)

    level += 2

    infixBindingPowers.set('TokenType#RightArrow', {left: level, right: level + 1})

    level += 2

    infixBindingPowers.set('TokenType#Dot', {left: level, right: level + 1})

    level += 2

    postfixBindingPowers.set('TokenType#LeftParenthesis', level)
    postfixBindingPowers.set('TokenType#LeftBracket', level)
    postfixBindingPowers.set('TokenType#Question', level)

})();

//=====================================================================================================================
