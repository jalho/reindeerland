use std::sync::mpsc;

mod usss;

fn main() {
    let cfg = usss::USSSInstanceOpts {
        upstream_command: "playerlistpos",
        upstream_state_sync_interval_ms: 100,
    };

    let (tx, rx) = mpsc::channel();

    // TODO: start n instances of usss, each with different args
    usss::start(tx, cfg);

    // TODO: aggregate received data of all usss instances (i.e. implement isr)
    for received in rx {
        println!("Got: {}", received);
    }

    // TODO: start m instances of dss that send the aggregated state to all connected downstreams
}
