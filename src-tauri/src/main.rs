#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// #![windows_subsystem = "console"]

use std::os::windows::process::CommandExt;
// REMOVE LOGGING IMPORTS WHEN NOT NEEDED STARTS
/* use std::fs::OpenOptions;
use std::path::PathBuf;
use std::io::Write; */
// REMOVE LOGGING IMPORTS WHEN NOT NEEDED ENDS

const CREATE_NO_WINDOW: u32 = 0x08000000;

// REMOVE LOGGING FUNCTION WHEN NOT NEEDED STARTS
/* fn get_app_data_dir() -> Option<PathBuf> {
    // Try to get AppData/Local directory
    dirs::data_local_dir()
        .map(|mut path| {
            path.push("CityNH");
            path.push("logs");
            path
        })
} */
// REMOVE LOGGING FUNCTION WHEN NOT NEEDED ENDS

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            std::thread::spawn(|| {
                std::thread::sleep(std::time::Duration::from_secs(2));

                if let Ok(exe_path) = std::env::current_exe() {
                    println!("Executable path: {:?}", exe_path);

                    if let Some(app_dir) = exe_path.parent() {
                        println!("App directory: {:?}", app_dir);

                        // Find backend bat file
                        let normal_bat = app_dir.join("python").join("start_backend.bat");
                        let updater_bat = app_dir.join("_up_").join("python").join("start_backend.bat");

                        let bat_path = if normal_bat.exists() {
                            println!("Found normal backend at: {:?}", normal_bat);
                            normal_bat
                        } else if updater_bat.exists() {
                            println!("Found updater backend at: {:?}", updater_bat);
                            updater_bat
                        } else {
                            println!("ERROR: start_backend.bat NOT FOUND!");
                            return;
                        };

                        println!("Launching backend from: {:?}", bat_path);
                        let work_dir = bat_path.parent().unwrap();
                        
                        // DEBUG MODE - UNCOMMENT TO SEE CONSOLE FOR DEBUGGING
                        #[cfg(debug_assertions)]
                        {
                            // UNCOMMENT BELOW TO SHOW CONSOLE WINDOW (FOR DEBUGGING ONLY)
                            
                            match std::process::Command::new("cmd")
                                .args(&["/C", "start", "cmd", "/K", bat_path.to_str().unwrap()])
                                .current_dir(work_dir)
                                .spawn()
                            {
                                Ok(_) => println!("Backend started with visible console."),
                                Err(e) => println!("Failed to start backend: {:?}", e),
                            }
                            
                            
                            // INSTEAD USE SILENT MODE EVEN IN DEBUG
                            match std::process::Command::new("cmd")
                                .args(&["/C", bat_path.to_str().unwrap()])
                                .current_dir(work_dir)
                                .creation_flags(CREATE_NO_WINDOW)  // Hides console
                                .spawn()
                            {
                                Ok(_) => println!("Backend started silently (debug mode)."),
                                Err(e) => println!("Failed to start backend: {:?}", e),
                            }
                        }
                        
                        // RELEASE MODE - SIMPLIFIED VERSION WITHOUT LOGGING
                        #[cfg(not(debug_assertions))]
                        {
                            println!("RELEASE MODE: Starting backend silently (no logging)");
                            
                            // SIMPLE SILENT EXECUTION - NO LOGGING, NO CONSOLE
                            match std::process::Command::new("cmd")
                                .args(&["/C", bat_path.to_str().unwrap()])
                                .current_dir(work_dir)
                                .creation_flags(CREATE_NO_WINDOW)  // This hides the black console window
                                .spawn()
                            {
                                Ok(_) => println!("Backend started successfully (no logs)."),
                                Err(e) => println!("Failed to start backend: {:?}", e),
                            }
                            
                            // UNCOMMENT BELOW SECTION TO ENABLE LOGGING WHEN NEEDED STARTS
                            
                            /*println!("LOGGING ENABLED: Logging to AppData");
                            
                            // Get AppData logs directory
                            let logs_dir = match get_app_data_dir() {
                                Some(dir) => {
                                    println!("Using AppData log directory: {:?}", dir);
                                    dir
                                },
                                None => {
                                    let fallback_dir = app_dir.join("logs");
                                    println!("Using fallback directory: {:?}", fallback_dir);
                                    fallback_dir
                                }
                            };
                            
                            // Try to create directory
                            if std::fs::create_dir_all(&logs_dir).is_err() {
                                println!("Cannot create log directory, starting without logs");
                                match std::process::Command::new("cmd")
                                    .args(&["/C", bat_path.to_str().unwrap()])
                                    .current_dir(work_dir)
                                    .creation_flags(CREATE_NO_WINDOW)
                                    .spawn()
                                {
                                    Ok(_) => println!("Backend started (no logs)."),
                                    Err(e) => println!("Failed to start backend: {:?}", e),
                                }
                                return;
                            }
                            
                            let log_path = logs_dir.join("backend.log");
                            println!("Logging to: {:?}", log_path);
                            
                            match OpenOptions::new()
                                .create(true)
                                .append(true)
                                .open(&log_path)
                            {
                                Ok(log_file) => {
                                    match std::process::Command::new("cmd")
                                        .args(&["/C", bat_path.to_str().unwrap()])
                                        .current_dir(work_dir)
                                        .creation_flags(CREATE_NO_WINDOW)
                                        .stdout(log_file.try_clone().unwrap())
                                        .stderr(log_file)
                                        .spawn()
                                    {
                                        Ok(_) => println!("Backend started with logging."),
                                        Err(e) => println!("Failed to start backend: {:?}", e),
                                    }
                                },
                                Err(e) => {
                                    println!("Failed to create log file: {:?}", e);
                                    match std::process::Command::new("cmd")
                                        .args(&["/C", bat_path.to_str().unwrap()])
                                        .current_dir(work_dir)
                                        .creation_flags(CREATE_NO_WINDOW)
                                        .spawn()
                                    {
                                        Ok(_) => println!("Backend started silently (no logging)."),
                                        Err(e) => println!("Failed to start backend: {:?}", e),
                                    }
                                }
                            }
                            */
                            // UNCOMMENT BELOW SECTION TO ENABLE LOGGING WHEN NEEDED ENDS
                        }
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}