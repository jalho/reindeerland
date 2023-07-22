use std::sync::mpsc;
use std::thread;
use std::time::Duration;

struct USSSStaticOpts {
    upstream_address: &'static str,
    rcon_password: &'static str,
}
const USSS_STATIC_OPTS: USSSStaticOpts = USSSStaticOpts {
    upstream_address: "ws://localhost:8081",
    rcon_password: "TODO",
};
fn get_usss_static_opts() -> USSSStaticOpts {
    return USSS_STATIC_OPTS;
}

pub struct USSSInstanceOpts {
    pub upstream_command: &'static str,
    pub upstream_state_sync_interval_ms: u64,
}
pub fn start(tx: mpsc::Sender<String>, opts: USSSInstanceOpts) -> thread::JoinHandle<()> {
    let h = thread::spawn(move || {
        let usss_static_opts = get_usss_static_opts();
        println!(
            "TODO: send cmd '{}' to upstream '{}' using password '{}'",
            opts.upstream_command,
            usss_static_opts.upstream_address,
            usss_static_opts.rcon_password
        );
        // TODO: get data from upstream
        // TODO: parse data and send it via tx
        let vals = vec![
            String::from("more"),
            String::from("messages"),
            String::from("for"),
            String::from("you"),
        ];
        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_millis(opts.upstream_state_sync_interval_ms));
        }
    });
    return h;
}
