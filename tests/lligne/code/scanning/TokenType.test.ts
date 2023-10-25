import {describe, it, expect} from 'vitest';
import {textOfTokenType} from "../../../../src/lib/lligne/code/scanning/TokenType";


describe('TokenType test', () => {
    it('retrieves token text', () => {
        expect(textOfTokenType('TokenType#Ampersand')).toBe("&");
        expect(textOfTokenType('TokenType#Identifier')).toBe("[identifier]");
        expect(textOfTokenType('TokenType#In')).toBe("in");
    });
});
