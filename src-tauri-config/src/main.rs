// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

#[tauri::command]
fn get_app_export_path(app_handle: tauri::AppHandle, base: String) -> Result<String, String> {
    let path_resolver = app_handle.path();
    let base_path = match base.as_str() {
        "Download" => path_resolver.download_dir(),
        "Documents" => path_resolver.document_dir(),
        _ => return Err("Invalid path type".to_string()),
    };

    match base_path {
        Ok(mut p) => {
            p.push("Quran_Video_Studio");
            Ok(p.to_string_lossy().to_string())
        },
        Err(e) => Err(e.to_string()),
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![get_app_export_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
