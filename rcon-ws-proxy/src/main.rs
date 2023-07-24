use std::sync::mpsc;

mod usss;

fn main() {
    let (tx, rx) = mpsc::channel();
    let tx_1 = tx;
    let tx_2 = tx_1.clone();

    // TODO: remove tx from "config" -- read config from filesystem at startup
    let configs: Vec<usss::USSSInstanceOpts> = vec![
        usss::USSSInstanceOpts {
            upstream_command: "playerlistpos",
            upstream_state_sync_interval_ms: 600,
            tx: tx_1,
        },
        usss::USSSInstanceOpts {
            upstream_command: "listtoolcupboards",
            upstream_state_sync_interval_ms: 600,
            tx: tx_2,
        },
    ];
    for config in configs {
        usss::start(config);
    }

    // TODO: aggregate received data of all usss instances (see "ISR" in README)
    for received in rx {
        println!("Got: {}", received);
    }

    /*
     * TODO:
     *  start m instances of "DSS" (see README) that send the aggregated state
     *  received from "ISR" to all connected downstreams
     */
}
