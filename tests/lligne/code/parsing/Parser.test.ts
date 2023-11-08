import {describe, it, expect} from 'vitest';
import {scan} from "../../../../src/lib/lligne/code/scanning/Scanner";
import {
    filterLeadingTrailingDocumentation
} from "../../../../src/lib/lligne/code/scanning/tokenfiltering/LeadingTrailingDocumentationFilter";
import {parseExpression} from "../../../../src/lib/lligne/code/parsing/Parser";


describe('Parser test', () => {
    const check = function(sourceCode: string) {
        let scanResult = scan(sourceCode)

        scanResult = filterLeadingTrailingDocumentation(scanResult)

        const parseResult = parseExpression(scanResult)

        expect(parseResult.Model.sourcePos.getText(sourceCode).length).toBeGreaterThan(0)
    }

    it("parses identifier literals", () => {
        check("abc")
        check("\n  d  \n")
    })

    it("parses integer literals", () => {
        check("123")
        check("789")
    })

    it("parses floating point literals", () => {
        check("1.23")
        check("78.9")
    })

    it("parses multiline string literals", () => {
        check("` line one\n ` line two\n")
    })

    it("parses string literals", () => {
        check(`"123"`)
        check(`'789'`)
    })

    it("parses leading documentation", () => {
        check("// line one\n // line two\nq")
    })

    it("parses trailing documentation", () => {
        check("q // line one\n // line two\n")
    })

    it("parses addition", () => {
        check("x + 1")
        check(" 3 + y")
        check("x + 1.7")
        check(" 3.666 + y")
    })

    it("parses built in types", () => {
        check("x: Int64")
        check("isWorking: Bool")
        check("amount: Float64")
        check("name: String")
    })

    it("parses table of expressions", () => {
        const tests = [
            "x + 1",
                "q - 4",
                "a - b + 3",
                "a + b + 3",
                "1 * 2",
                "x + 3 * g",
                "a + b / 2 - c",
                "-a",
                "-2 * a - b * -r",
                "a.b.c",
                "x.y + z.q",
                "\"s\"",
                "\"string tied in a knot\"",
                "'c'",

                "(x + 5)",
                "((x + 5) / 3)",
                "()",

                "{}",
                "{x: int && 5}",
                "{x: int && 5, y: string && \"s\"}",
                "{x: int ?: 5, y: string ?: \"s\"}",

                "[]",
                "[1, 2, 3, 4, 5]",

                "true and false",
                "a and b",
                "a and b or c",
                "a and not b",
                "not a or b",

                "1 == 2",
                "1 + 1 == 2 / 1",
                "1 + 1 < 2 / 1",
                "1 + 1 <= 2 / 1",
                "1 + 1 >= 2 / 1",

                "x =~ y",
                "x !~ y",

                "int?",
                "float | int?",
                "float & 7.0",

                "f(x: 0)",
                "(a: f(x: 0))",

                "1..9",
                "x in 1..9",

                "x is Widget",

                "1 when n == 0\n| n * f(n - 1) when n > 0",
                "f: (n: int) -> int = 1 when n == 0\n| n * f(n-1) when n > 0",

                "x = y + z where {y: 3, z: 5}",
        ]

        for (let test of tests) {
            check(test)
        }
    })


});
