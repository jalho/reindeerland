use log::{debug, info};
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

pub struct USSSStaticOpts {
    pub upstream_address: &'static str,
    pub rcon_password: &'static str,
}

pub struct USSSInstanceOpts {
    pub upstream_command: &'static str,
    pub upstream_state_sync_interval_ms: u64,
    pub tx: mpsc::Sender<String>,
}
pub fn start(
    instance_opts: USSSInstanceOpts,
    static_opts: USSSStaticOpts,
) -> thread::JoinHandle<()> {
    info!(
        "Starting '{}' in a new thread, sync interval: {} ms",
        instance_opts.upstream_command, instance_opts.upstream_state_sync_interval_ms
    );
    debug!(
        "upstream_address: '{}', rcon_password: '{}'",
        static_opts.upstream_address, static_opts.rcon_password
    );

    let h = thread::spawn(move || work(instance_opts, static_opts));
    return h;
}
fn work(opts: USSSInstanceOpts, _static_opts: USSSStaticOpts) {
    // TODO: get data from upstream
    // TODO: parse data and send it via tx
    let vals = vec![
        String::from("more"),
        String::from("messages"),
        String::from("for"),
        String::from("you"),
    ];
    for val in vals {
        opts.tx.send(val).unwrap();
        thread::sleep(Duration::from_millis(opts.upstream_state_sync_interval_ms));
    }
}
