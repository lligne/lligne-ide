import {describe, it, expect} from 'vitest';
import {textOfTokenType} from "../../../../src/lib/lligne/code/scanning/TokenType";


describe('TokenType test', () => {
    it('retrieves token text', () => {
        expect(textOfTokenType('#TokenTypeAmpersand')).toBe("&");
        expect(textOfTokenType('#TokenTypeIdentifier')).toBe("[identifier]");
        expect(textOfTokenType('#TokenTypeIn')).toBe("in");
    });
});
