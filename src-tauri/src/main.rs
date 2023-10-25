// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod lligne;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello {}. You've been greeted from the Lligne IDE!", name)
}


fn main() {
    use lligne::ide::repl::parse_from_repl;
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            parse_from_repl
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
