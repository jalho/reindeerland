use log::{debug, info};
use std::sync::mpsc;
use usss::USSSStaticOpts;

mod usss;

// TODO: get filename as CLI arg
const LOGGER_CONFIG_FILE: &str = "log4rs.yaml";

// TODO: remove const -- get configs from filesystem instead
const USSS_STATIC_OPTS: USSSStaticOpts = USSSStaticOpts {
    upstream_address: "ws://localhost:8081",
    rcon_password: "TODO",
};
fn get_usss_static_opts() -> USSSStaticOpts {
    // TODO: get from config file instead
    return USSS_STATIC_OPTS;
}

fn main() {
    log4rs::init_file(LOGGER_CONFIG_FILE, Default::default()).unwrap();
    info!("Logger initialized from '{}'", LOGGER_CONFIG_FILE);

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
        usss::start(config, get_usss_static_opts());
    }

    // TODO: aggregate received data of all usss instances (see "ISR" in README)
    for received in rx {
        debug!("TODO: handle received message '{}'", received);
    }

    /*
     * TODO:
     *  start m instances of "DSS" (see README) that send the aggregated state
     *  received from "ISR" to all connected downstreams
     */
}
