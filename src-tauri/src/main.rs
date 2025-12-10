#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            std::thread::spawn(|| {
                std::thread::sleep(std::time::Duration::from_secs(2));
                
                if let Ok(exe_path) = std::env::current_exe() {
                    if let Some(app_dir) = exe_path.parent() {
                        let bat_path = app_dir.join("python").join("start_backend.bat");
                        if bat_path.exists() {
                            let _ = std::process::Command::new("cmd")
                                .args(&["/C", bat_path.to_str().unwrap()])
                                .current_dir(app_dir.join("python"))
                                .spawn();
                        }
                    }
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}