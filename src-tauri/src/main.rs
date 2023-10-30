#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commonds;

use commonds::{TauriState,get_steam_info,launch_cs2,launch_csgo,flush_dns};

fn main() {
    tauri::Builder::default()
        .manage(TauriState {
           steam_info:Default::default()
        })
        .invoke_handler(tauri::generate_handler![get_steam_info,launch_cs2,launch_csgo,flush_dns])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
