//
// # Data types related to Lligne token scanning.
//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

//=====================================================================================================================

// Token is an abstract token of type token_type occurring at source_offset with length source_length in its source code.
#[derive(Clone, Copy)]
pub struct Token {
    pub source_offset: u32,
    pub source_length: u16,
    pub token_type: u16,
}

//=====================================================================================================================

#[cfg(test)]
mod tests {
    use std::mem::size_of;
    use super::*;

    #[test]
    fn test_token_size() {
        assert_eq!(8, size_of::<Token>());
    }
}

//=====================================================================================================================

