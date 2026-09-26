#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{atomic::{AtomicBool, Ordering}, Mutex};
use tauri::{Emitter, Manager};
use tauri_plugin_store::StoreExt;

#[derive(Default)]
struct Lifecycle { ready: AtomicBool, exiting: AtomicBool, write_lock: Mutex<()> }

fn data_directory(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    // Debug builds can run integration tests without touching the user's plan.
    #[cfg(debug_assertions)]
    if let Some(path) = std::env::var_os("LIFE_FLOW_TEST_DATA_DIR") {
        let path = std::path::PathBuf::from(path);
        if !path.is_absolute() { return Err("Test data directory must be absolute".into()); }
        return Ok(path);
    }
    app.path().app_data_dir().map_err(|e| e.to_string())
}

#[tauri::command]
fn load_plan(app: tauri::AppHandle) -> Result<Option<serde_json::Value>, String> {
    let path = data_directory(&app)?.join("flow.json");
    let data = match std::fs::read(path) {
        Ok(data) => data,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(None),
        Err(e) => return Err(e.to_string()),
    };
    let root: serde_json::Value = serde_json::from_slice(&data).map_err(|e| e.to_string())?;
    root.get("plan").filter(|value| !value.is_null()).cloned().map(Some).ok_or_else(|| "저장 파일에 계획이 없습니다.".into())
}

#[tauri::command]
fn save_plan(app: tauri::AppHandle, plan: serde_json::Value, state: tauri::State<Lifecycle>) -> Result<(), String> {
    let _guard = state.write_lock.lock().map_err(|e| e.to_string())?;
    let directory = data_directory(&app)?;
    std::fs::create_dir_all(&directory).map_err(|e| e.to_string())?;
    // Store owns only the staging file. A failed write never truncates flow.json,
    // and the plugin's shutdown save cannot overwrite the authoritative file.
    let staging = directory.join("flow.pending.json");
    let store = app.store_builder(&staging).disable_auto_save().build().map_err(|e| e.to_string())?;
    store.clear();
    store.set("plan", plan);
    store.save().map_err(|e| e.to_string())?;
    std::fs::OpenOptions::new().read(true).write(true).open(&staging).and_then(|file| file.sync_all()).map_err(|e| e.to_string())?;
    std::fs::rename(staging, directory.join("flow.json")).map_err(|e| e.to_string())
}

#[tauri::command]
fn frontend_ready(state: tauri::State<Lifecycle>) { state.ready.store(true, Ordering::SeqCst); }

#[tauri::command]
fn finish_exit(app: tauri::AppHandle, state: tauri::State<Lifecycle>) {
    state.exiting.store(true, Ordering::SeqCst);
    app.exit(0);
}

fn main() {
    tauri::Builder::default()
        .manage(Lifecycle::default())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![load_plan, save_plan, frontend_ready, finish_exit])
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let state = window.state::<Lifecycle>();
                if state.ready.load(Ordering::SeqCst) {
                    api.prevent_close();
                    let _ = window.emit("life-flow-close", ());
                } else { window.app_handle().exit(0); }
            }
        })
        .build(tauri::generate_context!())
        .expect("Life Flow could not start")
        .run(|app, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                let state = app.state::<Lifecycle>();
                if state.ready.load(Ordering::SeqCst) && !state.exiting.load(Ordering::SeqCst) {
                    api.prevent_exit();
                    let _ = app.emit("life-flow-close", ());
                }
            }
        });
}
