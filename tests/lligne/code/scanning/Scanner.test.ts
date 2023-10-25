import {describe, it, expect} from 'vitest';
import type {TokenType} from "../../../../src/lib/lligne/code/scanning/TokenType";
import {Scan} from "../../../../src/lib/lligne/code/scanning/Scanner";
import type {Token} from "../../../../src/lib/lligne/code/scanning/Token";


describe('Scanner test', () => {

    const expectToken = function(token: Token, expectedTokenType: TokenType, expectedSourceOffset: number, expectedLength: number) {
        expect(token.tokenType).toBe(expectedTokenType);
        expect(token.sourceOffset).toBe(expectedSourceOffset);
        expect(token.sourceLength).toBe(expectedLength);
    }

    it("scans an empty string", () => {
        const result = Scan("")

        expectToken(result.Tokens[0], 'TokenType#Eof', 0, 0)
        expect(result.NewLineOffsets.length).toBe(0)
    })

    it("scans an unrecognized character", () => {
        const result = Scan("‽")

        expectToken(result.Tokens[0], 'TokenType#UnrecognizedChar', 0, 1)
        expectToken(result.Tokens[1], 'TokenType#Eof', 1, 0)
        expect(result.NewLineOffsets.length).toBe(0)
    })

    it("scans a few punctuation tokens", () => {
        const result = Scan(
            "& &&\n *: , ",
        )

        expectToken(result.Tokens[0], 'TokenType#Ampersand', 0, 1)
        expectToken(result.Tokens[1], 'TokenType#AmpersandAmpersand', 2, 2)
        expectToken(result.Tokens[2], 'TokenType#Asterisk', 6, 1)
        expectToken(result.Tokens[3], 'TokenType#Colon', 7, 1)
        expectToken(result.Tokens[4], 'TokenType#Comma', 9, 1)
        expectToken(result.Tokens[5], 'TokenType#Eof', 11, 0)
        expect(result.NewLineOffsets.length).toBe(1)
    })

    it("scans a few identifier tokens", () => {
        const result = Scan(
            "a bb c23_f q-code _dfg",
        )

        expectToken(result.Tokens[0], 'TokenType#Identifier', 0, 1)
        expectToken(result.Tokens[1], 'TokenType#Identifier', 2, 2)
        expectToken(result.Tokens[2], 'TokenType#Identifier', 5, 5)
        expectToken(result.Tokens[3], 'TokenType#Identifier', 11, 6)
        expectToken(result.Tokens[4], 'TokenType#Identifier', 18, 4)
        expectToken(result.Tokens[5], 'TokenType#Eof', 22, 0)
        expect(result.NewLineOffsets.length).toBe(0)
    })

    it("scans a few integers", () => {
        const result = Scan(
            "123 4\n(99000) 5",
        )

        expectToken(result.Tokens[0], 'TokenType#IntegerLiteral', 0, 3)
        expectToken(result.Tokens[1], 'TokenType#IntegerLiteral', 4, 1)
        expectToken(result.Tokens[2], 'TokenType#LeftParenthesis', 6, 1)
        expectToken(result.Tokens[3], 'TokenType#IntegerLiteral', 7, 5)
        expectToken(result.Tokens[4], 'TokenType#RightParenthesis', 12, 1)
        expectToken(result.Tokens[5], 'TokenType#IntegerLiteral', 14, 1)
        expectToken(result.Tokens[6], 'TokenType#Eof', 15, 0)
        expect(result.NewLineOffsets.length).toBe(1)
    })

    it("scans a few numbers", () => {
        const result = Scan(
            "12.3 4\n(990.00) 5.1",
        )

        expectToken(result.Tokens[0], 'TokenType#FloatingPointLiteral', 0, 4)
        expectToken(result.Tokens[1], 'TokenType#IntegerLiteral', 5, 1)
        expectToken(result.Tokens[2], 'TokenType#LeftParenthesis', 7, 1)
        expectToken(result.Tokens[3], 'TokenType#FloatingPointLiteral', 8, 6)
        expectToken(result.Tokens[4], 'TokenType#RightParenthesis', 14, 1)
        expectToken(result.Tokens[5], 'TokenType#FloatingPointLiteral', 16, 3)
        expectToken(result.Tokens[6], 'TokenType#Eof', 19, 0)
        expect(result.NewLineOffsets.length).toBe(1)
    })

    it("scans a few double quoted strings", () => {
        const result = Scan(
            `"abc" "xyz" "bad
 "start over"`,
        )

        expectToken(result.Tokens[0], 'TokenType#DoubleQuotedString', 0, 5)
        expectToken(result.Tokens[1], 'TokenType#DoubleQuotedString', 6, 5)
        expectToken(result.Tokens[2], 'TokenType#UnclosedDoubleQuotedString', 12, 4)
        expectToken(result.Tokens[3], 'TokenType#DoubleQuotedString', 18, 12)
        expectToken(result.Tokens[4], 'TokenType#Eof', 30, 0)
        expect(result.NewLineOffsets.length).toBe(1)
    })

    it("scans a few single quoted strings", () => {
        const result = Scan(
            `'abc' 'xyz' 'bad
 'start over'`,
        )

        expectToken(result.Tokens[0], 'TokenType#SingleQuotedString', 0, 5)
        expectToken(result.Tokens[1], 'TokenType#SingleQuotedString', 6, 5)
        expectToken(result.Tokens[2], 'TokenType#UnclosedSingleQuotedString', 12, 4)
        expectToken(result.Tokens[3], 'TokenType#SingleQuotedString', 18, 12)
        expectToken(result.Tokens[4], 'TokenType#Eof', 30, 0)
        expect(result.NewLineOffsets.length).toBe(1)
    })

    it("scans a few back-ticked string lines", () => {
        const result = Scan(
            "`abc 123\n`  - one\n  `  - two\n\n  `another\n\n  `one more\n `and the end",
        )

        expectToken(result.Tokens[0], 'TokenType#BackTickedString', 0, 29)
        expectToken(result.Tokens[1], 'TokenType#BackTickedString', 32, 9)
        expectToken(result.Tokens[2], 'TokenType#BackTickedString', 44, 23)
        expectToken(result.Tokens[3], 'TokenType#Eof', 67, 0)
        expect(result.NewLineOffsets.length).toBe(7)
    })

    it("scans a few documentation lines", () => {
        const result = Scan(
            "// abc 123\n//  - one\n//two\n\n//\n//",
        )

        expectToken(result.Tokens[0], 'TokenType#Documentation', 0, 27)
        expectToken(result.Tokens[1], 'TokenType#Documentation', 28, 5)
        expectToken(result.Tokens[2], 'TokenType#Eof', 33, 0)
        expect(result.NewLineOffsets.length).toBe(5)
    })

    it("scans boolean literals", () => {
        const result = Scan(
            "true false",
        )

        expectToken(result.Tokens[0], 'TokenType#True', 0, 4)
        expectToken(result.Tokens[1], 'TokenType#False', 5, 5)
        expectToken(result.Tokens[2], 'TokenType#Eof', 10, 0)
        expect(result.NewLineOffsets.length).toBe(0)
    })

    it("scans built in types", () => {
        const result = Scan(
            "Boolean Float64 Int64 String",
        )

        expectToken(result.Tokens[0], 'TokenType#Boolean', 0, 7)
        expectToken(result.Tokens[1], 'TokenType#Float64', 8, 7)
        expectToken(result.Tokens[2], 'TokenType#Int64', 16, 5)
        expectToken(result.Tokens[3], 'TokenType#String', 22, 6)
        expectToken(result.Tokens[4], 'TokenType#Eof', 28, 0)
        expect(result.NewLineOffsets.length).toBe(0)
    })


});
