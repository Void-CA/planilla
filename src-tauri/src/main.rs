use tauri_plugin_sql;
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build()) // habilita SQLite
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
