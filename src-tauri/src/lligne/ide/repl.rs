use crate::lligne::code::parsing::parser;
use crate::lligne::code::scanning::scanner;
use crate::lligne::code::scanning::token_filters::leading_trailing_documentation;

#[tauri::command]
pub fn parse_from_repl(source_code: &str) -> String {
    println!("parse_from_source_code");

    let mut scan_result = scanner::scan(source_code);

    scan_result = leading_trailing_documentation::filter(scan_result);

    let expression = parser::parse_expression(&scan_result);

    assert!(expression.model.get_source_position().start_offset <
        expression.model.get_source_position().end_offset);

    return format!("Parsed");
}
