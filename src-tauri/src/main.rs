#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commonds;

use std::env;

use commonds::{
    flush_dns, get_steam_info, get_steam_info_inner, launch_cs2, launch_csgo, TauriState,
};

#[tokio::main]
async fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() != 1 {
        get_steam_info_inner().await;
        return;
    }

    tauri::Builder::default()
        .manage(TauriState {
            steam_info: Default::default(),
        })
        .invoke_handler(tauri::generate_handler![
            get_steam_info,
            launch_cs2,
            launch_csgo,
            flush_dns
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
