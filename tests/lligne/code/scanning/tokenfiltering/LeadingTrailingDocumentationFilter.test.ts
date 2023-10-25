import {describe, it, expect} from 'vitest';
import type {Token} from "../../../../../src/lib/lligne/code/scanning/Token";
import type {TokenType} from "../../../../../src/lib/lligne/code/scanning/TokenType";
import {Scan} from "../../../../../src/lib/lligne/code/scanning/Scanner";
import {
    filterLeadingTrailingDocumentation
} from "../../../../../src/lib/lligne/code/scanning/tokenfiltering/LeadingTrailingDocumentationFilter";


describe('LeadingTrailingDocumentationFilter test', () => {
    const expectToken = function (token: Token, expectedTokenType: TokenType, expectedSourceOffset: number, expectedLength: number) {
        expect(token.tokenType).toBe(expectedTokenType)
        expect(token.sourceOffset).toBe(expectedSourceOffset)
        expect(token.sourceLength).toBe(expectedLength)
    }

    it('filters documentation tokens', () => {
        const sourceCode = `
// Leading documentation
  // with two lines
stuff {
    inner, // Trailing documentation 1
    more;  // Trailing documentation 2
    another  // Trailing 3
         // documentation

    // Leading documentation after trailing
    onemorevar

	gadget

	// Leading after non-doc
	junk
}
`
        let scanOutcome = Scan(sourceCode)
        scanOutcome = filterLeadingTrailingDocumentation(scanOutcome)
        const tokens = scanOutcome.Tokens

        expectToken(tokens[0], 'TokenType#LeadingDocumentation', 1, 45)
        expectToken(tokens[1], 'TokenType#SynthDocument', 1, 0)
        expectToken(tokens[2], 'TokenType#Identifier', 46, 5)
        expectToken(tokens[3], 'TokenType#LeftBrace', 52, 1)
        expectToken(tokens[4], 'TokenType#Identifier', 58, 5)
        expectToken(tokens[5], 'TokenType#SynthDocument', 65, 0)
        expectToken(tokens[6], 'TokenType#TrailingDocumentation', 65, 32)
        expectToken(tokens[7], 'TokenType#Comma', 63, 1)
        expectToken(tokens[8], 'TokenType#Identifier', 97, 4)
        expectToken(tokens[9], 'TokenType#SynthDocument', 104, 0)
        expectToken(tokens[10], 'TokenType#TrailingDocumentation', 104, 32)
        expectToken(tokens[11], 'TokenType#Semicolon', 101, 1)
        expectToken(tokens[12], 'TokenType#Identifier', 136, 7)
        expectToken(tokens[13], 'TokenType#SynthDocument', 145, 0)
        expectToken(tokens[14], 'TokenType#TrailingDocumentation', 145, 40)
        expectToken(tokens[15], 'TokenType#LeadingDocumentation', 190, 44)
        expectToken(tokens[16], 'TokenType#SynthDocument', 190, 0)
        expectToken(tokens[17], 'TokenType#Identifier', 234, 10)
        expectToken(tokens[18], 'TokenType#Identifier', 247, 6)
        expectToken(tokens[19], 'TokenType#LeadingDocumentation', 256, 26)
        expectToken(tokens[20], 'TokenType#SynthDocument', 256, 0)
        expectToken(tokens[21], 'TokenType#Identifier', 282, 4)
        expectToken(tokens[22], 'TokenType#RightBrace', 287, 1)
        expectToken(tokens[23], 'TokenType#Eof', sourceCode.length, 0)

    })
});

