//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

use crate::lligne::code::scanning::tokens::Token;

//=====================================================================================================================

// Represents a range of source code bytes from start_offset to end_offset.
#[derive(Debug, Copy, Clone)]
pub struct SourcePos {
    pub start_offset: u32,
    pub end_offset: u32,
}

//---------------------------------------------------------------------------------------------------------------------

// new_source_pos constructs a SourcePos instance.
pub fn new_source_pos(token: Token) -> SourcePos {
    return SourcePos {
        start_offset: token.source_offset,
        end_offset: token.source_offset + token.source_length as u32,
    };
}

//---------------------------------------------------------------------------------------------------------------------

impl SourcePos {
    // Slices the given source_code to produce the string demarcated by the source position.
    pub fn get_text<'a>(&self, source_code: &'a str) -> &'a str {
        let text_range = (self.start_offset as usize)..(self.end_offset as usize);
        return &source_code[text_range];
    }

    //-----------------------------------------------------------------------------------------------------------------

    // Creates a new source position extending from the start of one to the end of another.
    pub fn thru(&self, s2: SourcePos) -> SourcePos {
        if s2.end_offset < self.start_offset {
            panic!("Source Positions not in correct order.")
        }

        return SourcePos {
            start_offset: self.start_offset,
            end_offset: s2.end_offset,
        };
    }
}

//=====================================================================================================================

#[cfg(test)]
mod tests {
    use std::mem::size_of;
    use super::*;

    #[test]
    fn test_source_pos_size() {
        assert_eq!(8, size_of::<SourcePos>());
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
