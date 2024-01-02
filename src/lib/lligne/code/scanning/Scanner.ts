//
// # Scanner for Lligne tokens.
//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {TokenType} from "./TokenType";
import type {Token} from "./Token";

//=====================================================================================================================

export type Outcome = {
    readonly sourceCode: string,
    readonly tokens: Token[],
    readonly newLineOffsets: number[]
}

//=====================================================================================================================

// Converts the given source code to an array of tokens plus an array of new line character offsets.
export function scan(sourceCode: string): Outcome {

    // Create a scanner.
    const scanner = new Scanner(sourceCode)

    // Scan the entire source code.
    scanner.scan()

    // Extract the results.
    return {
        sourceCode: sourceCode,
        tokens: scanner.tokens,
        newLineOffsets: scanner.newLineOffsets,
    }

}

//=====================================================================================================================

// Converts a string of Lligne source code into tokens.
class Scanner {
    readonly sourceCode: string;
    markedPos: number;
    currentPos: number;
    charAhead1: string;
    charAhead2: string;
    tokens: Token[];
    newLineOffsets: number[];

    constructor(sourceCode: string) {
        this.sourceCode = sourceCode
        this.markedPos = 0
        this.currentPos = 0
        this.charAhead1 = '\0'
        this.charAhead2 = '\0'
        this.newLineOffsets = []
        this.tokens = []

        // Read the first rune.
        if (sourceCode.length > 0) {
            this.charAhead1 = sourceCode.charAt(0)
        }

        if (sourceCode.length > 1) {
            this.charAhead2 = sourceCode.charAt(1)
        }
    }

    /**
     * Converts the source code to an array of tokens.
     */
    scan() {
        while (true) {
            let token = this.#readToken()
            this.tokens.push(token)

            if (token.tokenType == '#TokenTypeEof') {
                // Two extra EOF tokens for no lookahead surprises.
                this.tokens.push(token)
                this.tokens.push(token)
                break
            }
        }
    }

    /** Consumes one rune and stages the next one in the scanner. */
    #advance() {

        if (this.charAhead1 == '\n') {
            this.newLineOffsets.push(this.currentPos);
        }
        this.currentPos += 1;
        this.charAhead1 = this.charAhead2

        if (this.currentPos + 1 >= this.sourceCode.length) {
            this.charAhead2 = '\0';
        } else {
            this.charAhead2 = this.sourceCode.charAt(this.currentPos + 1)
        }

    }

    #isDigit(ch: string) {
        return "0123456789".indexOf(ch) >= 0
    }

    #isWhiteSpace(ch: string) {
        // TODO: needs work
        const whiteSpaceChars = " \t\r\n"

        return whiteSpaceChars.indexOf(ch) >= 0
    }

    /** Returns the next token from the scanner. */
    #readToken(): Token {

        // Ignore whitespace
        while (this.#isWhiteSpace(this.charAhead1)) {
            this.#advance()
        }

        // Mark the start of the token
        this.markedPos = this.currentPos

        // Consume the next character.
        let ch = this.charAhead1
        this.#advance()

        // Handle character ranges.
        if (this.#isIdentifierStart(ch)) {
            return this.#scanIdentifierOrKeyword()
        }

        if (this.#isDigit(ch)) {
            return this.#scanNumber()
        }

        // Handle individual characters.
        switch (ch) {
            case '&':
                return this.#oneOrTwoRuneToken('#TokenTypeAmpersand', '&', '#TokenTypeAmpersandAmpersand')
            case '*':
                return this.#token('#TokenTypeAsterisk')
            case '@':
                return this.#token('#TokenTypeAtSign')
            case '`':
                return this.#scanBackTickedString()
            case ':':
                return this.#token('#TokenTypeColon')
            case ',':
                return this.#token('#TokenTypeComma')
            case '-':
                return this.#oneOrTwoRuneToken('#TokenTypeDash', '>', '#TokenTypeRightArrow')
            case '.':
                return this.#oneToThreeRuneToken('#TokenTypeDot', '.', '#TokenTypeDotDot', '.', '#TokenTypeDotDotDot')
            case '=':
                return this.#scanAfterEquals()
            case '!':
                return this.#scanAfterExclamationMark()
            case '<':
                return this.#oneOrTwoRuneToken('#TokenTypeLessThan', '=', '#TokenTypeLessThanOrEquals')
            case '>':
                return this.#oneOrTwoRuneToken('#TokenTypeGreaterThan', '=', '#TokenTypeGreaterThanOrEquals')
            case '#':
                return this.#token('#TokenTypeHash')
            case '{':
                return this.#token('#TokenTypeLeftBrace')
            case '[':
                return this.#token('#TokenTypeLeftBracket')
            case '(':
                return this.#token('#TokenTypeLeftParenthesis')
            case '+':
                return this.#token('#TokenTypePlus')
            case '?':
                return this.#oneOrTwoRuneToken('#TokenTypeQuestion', ':', '#TokenTypeQuestionColon')
            case '}':
                return this.#token('#TokenTypeRightBrace')
            case ']':
                return this.#token('#TokenTypeRightBracket')
            case ')':
                return this.#token('#TokenTypeRightParenthesis')
            case ';':
                return this.#token('#TokenTypeSemicolon')
            case '/':
                return this.#scanAfterSlash()
            case '"':
                return this.#scanDoubleQuotedString()
            case '\'':
                return this.#scanSingleQuotedString()
            case '|':
                return this.#token('#TokenTypeVerticalBar')
            case '\0':
                return {
                    sourceOffset: this.markedPos,
                    sourceLength: 0,
                    tokenType: '#TokenTypeEof'
                }
        }

        return this.#token('#TokenTypeUnrecognizedChar')

    }

    // Determines whether a given character could be the second or later character of an identifier.
    #isIdentifierPart(ch: string, chNext: string): boolean {
        return this.#isIdentifierStart(ch) || this.#isDigit(ch) ||
            ch == '-' && (this.#isIdentifierStart(chNext) || this.#isDigit(chNext))
    }

    // Determines whether a given character could be the opening character of an identifier.
    #isIdentifierStart(ch: string): boolean {
        // TODO: needs Unicode identifier chars
        return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || ch == '_'
    }

    // Scans a sequence of runes that could be one or two characters in length.
    #oneOrTwoRuneToken(
        oneRuneType: TokenType,
        secondRune: string,
        twoRuneType: TokenType
    ): Token {

        if (this.charAhead1 == secondRune) {
            this.#advance()
            return this.#token(twoRuneType)
        }

        return this.#token(oneRuneType)

    }

    // Scans a sequence of runes that could be one, two, or three characters in length.
    #oneToThreeRuneToken(
        oneRuneType: TokenType,
        secondRune: string,
        twoRuneType: TokenType,
        thirdRune: string,
        threeRuneType: TokenType
    ): Token {

        if (this.charAhead1 == secondRune) {
            this.#advance()

            if (this.charAhead1 == thirdRune) {
                this.#advance()

                return this.#token(threeRuneType)
            }

            return this.#token(twoRuneType)
        }

        return this.#token(oneRuneType)

    }

    // Scans one of: '=', '==', '===', '=~'.
    #scanAfterEquals(): Token {

        if (this.charAhead1 == '=') {
            this.#advance()

            if (this.charAhead1 == '=') {
                this.#advance()

                return this.#token('#TokenTypeEqualsEqualsEquals')
            }

            return this.#token('#TokenTypeEqualsEquals')

        }

        if (this.charAhead1 == '~') {
            this.#advance()
            return this.#token('#TokenTypeEqualsTilde')
        }

        return this.#token('#TokenTypeEquals')

    }

    // Scans one of: '!', '!=', '!~'.
    #scanAfterExclamationMark(): Token {

        if (this.charAhead1 == '=') {
            this.#advance()

            return this.#token('#TokenTypeExclamationEquals')
        }

        if (this.charAhead1 == '~') {
            this.#advance()
            return this.#token('#TokenTypeExclamationTilde')
        }

        return this.#token('#TokenTypeExclamation')

    }

    // Scans either just the slash or else a comment extending to the end of the line.
    #scanAfterSlash(): Token {

        if (this.charAhead1 == '/') {
            this.#advance()

            return this.#scanDocumentation()
        }

        return this.#token('#TokenTypeSlash')

    }

    // Consumes a multiline back-ticked string.
    #scanBackTickedString(): Token {

        const mark = this.markedPos

        while (true) {

            // Consume to the end of the line.
            while (this.charAhead1 != '\n' && this.charAhead1 != '\0') {
                this.#advance()
            }

            // Quit if hit the end of input.
            if (this.charAhead1 == '\0') {
                break
            }

            this.#advance()

            // Ignore whitespace
            while (this.charAhead1 != '\n' && this.#isWhiteSpace(this.charAhead1)) {
                this.#advance()
            }

            // Quit after seeing something other than another back-ticked string on the subsequent line.
            // @ts-ignore
            if (this.charAhead1 != "`") {
                break
            }

            // Mark the start of the next line and consume the back tick
            this.markedPos = this.currentPos
            this.#advance()

        }

        return {
            sourceOffset: mark,
            sourceLength: this.currentPos - mark,
            tokenType: '#TokenTypeBackTickedString',
        }

    }

    // Consumes a multiline comment.
    #scanDocumentation(): Token {

        const mark = this.markedPos

        while (true) {

            // Consume to the end of the line.
            while (this.charAhead1 != '\n' && this.charAhead1 != '\0') {
                this.#advance()
            }

            // Quit if hit the end of input.
            if (this.charAhead1 == '\0') {
                break
            }

            this.#advance()

            // Ignore whitespace
            while (this.charAhead1 != '\n' && this.#isWhiteSpace(this.charAhead1)) {
                this.#advance()
            }

            // Quit after seeing something other than another back-ticked string on the subsequent line.
            // @ts-ignore
            if (this.charAhead1 != '/' || this.sourceCode[this.currentPos + 1] != '/') {
                break
            }

            // Mark the start of the next line and consume the "//"
            this.markedPos = this.currentPos
            this.#advance()
            this.#advance()

        }

        return {
            sourceOffset: mark,
            sourceLength: this.currentPos - mark,
            tokenType: '#TokenTypeDocumentation'
        }

    }

    // Scans the remainder of a string literal after the initial double quote character has been consumed.
    #scanDoubleQuotedString(): Token {

        while (true) {
            switch (this.charAhead1) {
                case '"':
                    this.#advance()
                    return this.#token('#TokenTypeDoubleQuotedString')

                case '\\':
                    this.#advance()
                    // TODO: handle escape sequences properly
                    this.#advance()
                    break;

                case '\n':
                    return this.#token('#TokenTypeUnclosedDoubleQuotedString')

                default:
                    this.#advance()
            }
        }

    }

    // Scans the remainder of an identifier after the opening letter has been consumed.
    #scanIdentifierOrKeyword(): Token {

        while (this.#isIdentifierPart(this.charAhead1, this.charAhead2)) {
            this.#advance()
        }

        const text = this.sourceCode.substring(this.markedPos, this.currentPos)

        const keywordTokenType = keywords[text]
        if (keywordTokenType) {
            return {
                sourceOffset: this.markedPos,
                sourceLength: this.currentPos - this.markedPos,
                tokenType: keywordTokenType,
            }
        }

        return {
            sourceOffset: this.markedPos,
            sourceLength: this.currentPos - this.markedPos,
            tokenType: '#TokenTypeIdentifier',
        }

    }

    // Scans a numeric literal after the opening digit has been consumed.
    #scanNumber(): Token {

        while (this.#isDigit(this.charAhead1)) {
            this.#advance()
        }

        if (this.charAhead1 == '.' && this.#isDigit(this.charAhead2)) {
            this.#advance()
            return this.#scanNumberFloatingPoint()
        }

        return this.#token('#TokenTypeIntegerLiteral')

    }

    // Scans a floating point literal after the decimal point has been consumed.
    #scanNumberFloatingPoint(): Token {

        while (this.#isDigit(this.charAhead1)) {
            this.#advance()
        }

        // TODO: exponents

        return this.#token('#TokenTypeFloatingPointLiteral')

    }

    // Scans the remainder of a string literal after the initial single quote character has been consumed.
    #scanSingleQuotedString(): Token {

        while (true) {
            switch (this.charAhead1) {
                case        '\''    :
                    this.#advance()
                    return this.#token('#TokenTypeSingleQuotedString')
                case        '\\'    :
                    this.#advance()
                    // TODO: handle escape sequences properly
                    this.#advance()
                    break
                case        '\n'    :
                    return this.#token('#TokenTypeUnclosedSingleQuotedString')
                default:
                    this.#advance()
            }
        }

    }

    // Builds a new token of given type with text from the marked position to the current position.
    #token(tokenType: TokenType): Token {
        return {
            sourceOffset: this.markedPos,
            sourceLength: this.currentPos - this.markedPos,
            tokenType: tokenType,
        }
    }

}

//=====================================================================================================================

const keywords: { [key: string]: TokenType } = {
    "and": '#TokenTypeAnd',
    "as": '#TokenTypeAs',
    "Boolean": '#TokenTypeBoolean',
    "false": '#TokenTypeFalse',
    "Float64": '#TokenTypeFloat64',
    "is": '#TokenTypeIs',
    "in": '#TokenTypeIn',
    "Int64": '#TokenTypeInt64',
    "not": '#TokenTypeNot',
    "or": '#TokenTypeOr',
    "String": '#TokenTypeString',
    "true": '#TokenTypeTrue',
    "when": '#TokenTypeWhen',
    "where": '#TokenTypeWhere',
}

//=====================================================================================================================
