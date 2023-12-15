import {describe, it, expect} from 'vitest';
import type {Token} from "../../../../../src/lib/lligne/code/scanning/Token";
import type {TokenType} from "../../../../../src/lib/lligne/code/scanning/TokenType";
import {scan} from "../../../../../src/lib/lligne/code/scanning/Scanner";
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
        let scanOutcome = scan(sourceCode)
        scanOutcome = filterLeadingTrailingDocumentation(scanOutcome)
        const tokens = scanOutcome.Tokens

        expectToken(tokens[0], '#TokenTypeLeadingDocumentation', 1, 45)
        expectToken(tokens[1], '#TokenTypeSynthDocument', 1, 0)
        expectToken(tokens[2], '#TokenTypeIdentifier', 46, 5)
        expectToken(tokens[3], '#TokenTypeLeftBrace', 52, 1)
        expectToken(tokens[4], '#TokenTypeIdentifier', 58, 5)
        expectToken(tokens[5], '#TokenTypeSynthDocument', 65, 0)
        expectToken(tokens[6], '#TokenTypeTrailingDocumentation', 65, 32)
        expectToken(tokens[7], '#TokenTypeComma', 63, 1)
        expectToken(tokens[8], '#TokenTypeIdentifier', 97, 4)
        expectToken(tokens[9], '#TokenTypeSynthDocument', 104, 0)
        expectToken(tokens[10], '#TokenTypeTrailingDocumentation', 104, 32)
        expectToken(tokens[11], '#TokenTypeSemicolon', 101, 1)
        expectToken(tokens[12], '#TokenTypeIdentifier', 136, 7)
        expectToken(tokens[13], '#TokenTypeSynthDocument', 145, 0)
        expectToken(tokens[14], '#TokenTypeTrailingDocumentation', 145, 40)
        expectToken(tokens[15], '#TokenTypeLeadingDocumentation', 190, 44)
        expectToken(tokens[16], '#TokenTypeSynthDocument', 190, 0)
        expectToken(tokens[17], '#TokenTypeIdentifier', 234, 10)
        expectToken(tokens[18], '#TokenTypeIdentifier', 247, 6)
        expectToken(tokens[19], '#TokenTypeLeadingDocumentation', 256, 26)
        expectToken(tokens[20], '#TokenTypeSynthDocument', 256, 0)
        expectToken(tokens[21], '#TokenTypeIdentifier', 282, 4)
        expectToken(tokens[22], '#TokenTypeRightBrace', 287, 1)
        expectToken(tokens[23], '#TokenTypeEof', sourceCode.length, 0)

    })
});

