//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

//=====================================================================================================================

// SourcePos represents a range of source code characters from startOffset to endOffset.
import type {Token} from "../scanning/Token";

export class SourcePos {
    readonly startOffset: number
    readonly endOffset: number

    constructor(startOffset: number,
                endOffset: number) {
        this.startOffset = startOffset
        this.endOffset = endOffset
    }

    static fromToken(token: Token): SourcePos {
        return new SourcePos(token.sourceOffset,
            token.sourceOffset + token.sourceLength)
    }

    // Slices the given sourceCode to produce the string demarcated by the source position.
    getText(sourceCode: string): string {
        return sourceCode.substring(this.startOffset, this.endOffset)
    }

    // Creates a new source position extending from the start of one to the end of another.
    thru(that: SourcePos): SourcePos {

        if (that.endOffset < this.startOffset) {
            throw Error("Source Positions not in correct order.")
        }

        return new SourcePos(
            this.startOffset,
            that.endOffset
        )

    }

}


//=====================================================================================================================

//func (t *LligneTokenOriginTracker) GetOrigin(sourcePos int) LligneOrigin {
//
//	priorNewLinePos := 0
//	if len(t.newLinePositions) > 0 {
//		iMin := 0
//		iMax := len(t.newLinePositions)
//		for iMax-iMin > 1 {
//			iMid := (iMin + iMax) / 2
//			if sourcePos > t.newLinePositions[iMid] {
//				iMin = iMid
//			} else {
//				iMax = iMid
//			}
//		}
//		priorNewLinePos = iMin
//	}
//
//	return LligneOrigin{
//		FileName: t.fileName,
//		Line:     priorNewLinePos + 1,
//		Column:   sourcePos - t.newLinePositions[priorNewLinePos],
//	}
//
//}

//=====================================================================================================================
