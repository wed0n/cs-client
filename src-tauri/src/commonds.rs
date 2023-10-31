use std::ffi::OsStr;
use std::io::{Read, Seek, SeekFrom, Write};
use std::os::windows::process::CommandExt;
use std::process::Stdio;
use std::{env::current_exe, fs::File, path::PathBuf, process::Command};

use futures::io::AsyncWriteExt;
use futures::AsyncReadExt;
use interprocess::os::windows::named_pipe::tokio::{
    ByteReaderPipeStream, ByteWriterPipeStream, PipeListener, PipeListenerOptionsExt,
};
use interprocess::os::windows::named_pipe::{PipeListenerOptions, PipeMode};
use steamworks::{AppId, Client};
use tauri::State;
use tokio::sync::Mutex;

pub struct TauriState {
    pub steam_info: Mutex<SteamInfo>,
}

#[derive(Default)]
pub struct SteamInfo {
    cs_root_dir: String,
}

pub async fn get_steam_info_inner() {
    flush_dns_sync();
    let mut writer = ByteWriterPipeStream::connect("wed0n-cs").unwrap();
    //V社要求目录下必须有一个steam_appid.txt文件记录着一个有效的游戏ID
    let mut path = current_exe().unwrap();
    path.pop();
    path.push("steam_appid.txt");
    let mut file;
    match File::options().read(true).write(true).open(&path) {
        Ok(result) => file = result,
        Err(error) => match error.kind() {
            std::io::ErrorKind::NotFound => {
                file = File::options()
                    .read(true)
                    .write(true)
                    .create_new(true)
                    .open(&path)
                    .unwrap()
            }
            other => {
                writer
                    .write_all(format!("未知错误:\n{:?}", other.to_string()).as_bytes())
                    .await
                    .unwrap();
                return;
            }
        },
    }
    let mut contents = String::new();
    file.read_to_string(&mut contents).unwrap();
    if contents != "730" {
        file.set_len(0).unwrap();
        file.seek(SeekFrom::Start(0)).unwrap();
        file.write_all("730".as_bytes()).unwrap();
    }

    match Client::init() {
        Ok((client, _single)) => {
            let steam_id;
            let cs_root_dir;
            {
                let apps = client.apps();
                let user = client.user();
                steam_id = user.steam_id().steamid32();
                cs_root_dir = apps.app_install_dir(AppId::from(730));
            }
            writer
                .write_all(format!("{}\n{}", steam_id, cs_root_dir).as_bytes())
                .await
                .unwrap();
        }
        Err(_) => writer.write_all("Steam未开启".as_bytes()).await.unwrap(),
    }
}

#[tauri::command]
pub async fn get_steam_info(state: State<'_, TauriState>) -> Result<String, String> {
    let pipe: PipeListener<ByteReaderPipeStream> = PipeListenerOptions::new()
        .name(OsStr::new("wed0n-cs"))
        .mode(PipeMode::Bytes)
        .nonblocking(true)
        .create_tokio()
        .unwrap();
    let tmp = pipe.accept();

    // 由于与Steam建立连接后，只有当进程关闭时，Steam才会显示游戏已停止
    // 因此使用进程间通信获取Steam的信息
    let path = current_exe().unwrap();
    let _output = Command::new(path).arg("info").output().unwrap();

    let mut raw_string = String::new();
    let mut stream = tmp.await.unwrap();
    stream.read_to_string(&mut raw_string).await.unwrap();

    // println!("{}", raw_string);
    let strs: Vec<&str> = raw_string.split("\n").collect();
    if strs.len() == 2 {
        let steam_id = strs[0].to_string();
        let cs_root_dir = strs[1].to_string();
        *state.steam_info.lock().await = SteamInfo { cs_root_dir };
        return Ok(steam_id);
    }
    Err(raw_string)
}

fn flush_dns_sync() {
    Command::new("ipconfig")
        .arg("/flushdns")
        .stdout(Stdio::null())
        .creation_flags(0x08000000) //防止生成窗口
        .spawn()
        .unwrap();
}

#[tauri::command]
pub async fn flush_dns() -> Result<(), ()> {
    flush_dns_sync();
    Ok(())
}

#[tauri::command]
pub async fn launch_csgo(state: State<'_, TauriState>, target: &str) -> Result<(), String> {
    let cs_root_path = state.steam_info.lock().await.cs_root_dir.clone();
    let mut cs_path = PathBuf::from(cs_root_path);
    cs_path.push("csgo.exe");
    let mut command = Command::new(cs_path);
    command.args(["-insecure", "-worldwide", "+connect", target]);
    match command.spawn() {
        Ok(_) => Ok(()),
        Err(err) => Err(format!("启动CSGO失败\n{:?}", err.to_string())),
    }
}

#[tauri::command]
pub async fn launch_cs2(state: State<'_, TauriState>, target: &str) -> Result<(), String> {
    let cs_root_path = state.steam_info.lock().await.cs_root_dir.clone();
    let mut cs_path = PathBuf::from(cs_root_path);
    cs_path.push("game\\bin\\win64\\cs2.exe");
    let mut command = Command::new(cs_path);
    command.args(["-worldwide", "+connect", target]);
    match command.spawn() {
        Ok(_) => Ok(()),
        Err(err) => Err(format!("启动CSGO失败\n{:?}", err.to_string())),
    }
}
