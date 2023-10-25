//
// # Filter to convert documentation tokens into synthetic leading and trailing documentation tokens.
//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

//=====================================================================================================================

// Converts multiline documentation tokens to leading or trailing documentation.
import type {Outcome} from "../Scanner";
import type {Token} from "../Token";

export function filterLeadingTrailingDocumentation(scanResult: Outcome): Outcome {
    const tokens = scanResult.Tokens
    const result: Token[] = []

    let index = 0
    while (index < tokens.length - 1) {
        if (tokens[index].tokenType == 'TokenType#Documentation') {
            result.push({
                sourceOffset: tokens[index].sourceOffset,
                sourceLength: tokens[index].sourceLength,
                tokenType: 'TokenType#LeadingDocumentation'
            })
            result.push({
                sourceOffset: tokens[index].sourceOffset,
                sourceLength: 0,
                tokenType: 'TokenType#SynthDocument'
            })
            index += 1
        } else if (tokens[index + 1].tokenType == 'TokenType#Documentation') {
            if (tokensOnSameLine(scanResult.SourceCode, tokens[index].sourceOffset, tokens[index + 1].sourceOffset)) {

                if (tokens[index].tokenType == 'TokenType#Comma' || tokens[index].tokenType == 'TokenType#Semicolon') {
                    result.push({
                        sourceOffset: tokens[index + 1].sourceOffset,
                        sourceLength: 0,
                        tokenType: 'TokenType#SynthDocument'
                    })
                    result.push({
                        sourceOffset: tokens[index + 1].sourceOffset,
                        sourceLength: tokens[index + 1].sourceLength,
                        tokenType: 'TokenType#TrailingDocumentation'
                    })
                }

                result.push(tokens[index])

                if (tokens[index].tokenType != 'TokenType#Comma' && tokens[index].tokenType != 'TokenType#Semicolon') {
                    result.push({
                        sourceOffset: tokens[index + 1].sourceOffset,
                        sourceLength: 0,
                        tokenType: 'TokenType#SynthDocument'
                    })
                    result.push({
                        sourceOffset: tokens[index + 1].sourceOffset,
                        sourceLength: tokens[index + 1].sourceLength,
                        tokenType: 'TokenType#TrailingDocumentation'
                    })
                }

                index += 2
            } else {
                result.push(tokens[index])

                result.push({
                    sourceOffset: tokens[index + 1].sourceOffset,
                    sourceLength: tokens[index + 1].sourceLength,
                    tokenType: 'TokenType#LeadingDocumentation'
                })
                result.push({
                    sourceOffset: tokens[index + 1].sourceOffset,
                    sourceLength: 0,
                    tokenType: 'TokenType#SynthDocument'
                })
                index += 2

            }
        } else {
            result.push(tokens[index])
            index += 1
        }
    }

    return {
        SourceCode: scanResult.SourceCode,
        Tokens: result,
        NewLineOffsets: scanResult.NewLineOffsets
    }
}

//---------------------------------------------------------------------------------------------------------------------

// tokensOnSameLine looks for a line feed in the source code between two tokens.
function tokensOnSameLine(sourceCode: string, token1StartPos: number, token2StartPos: number): boolean {
    return sourceCode.substring(token1StartPos, token2StartPos).indexOf('\n') < 0
}

//=====================================================================================================================
