#!/bin/bash

LOGFILE="$0.log"
ENVFILE=$1 # e.g. "/opt/run/rust-server/.env"

if ! test -f $ENVFILE || test -z $ENVFILE; then
    echo "[$(date)] Env file expected as the first argument! Won't proceed without it!" 2>&1 | tee -a $LOGFILE
    exit 1
else
    source $ENVFILE
fi

# always remove other instance data than blueprints and cfg/ dir
# check if day of the month is <= 7 and conditionally rm blueprints
conditionallyRemoveDataFile() {
    if test -d $1; then
        echo "[$(date)] $1 is directory; not removing" 2>&1 | tee -a $LOGFILE
    else
        if $(echo $1 | grep -q blueprint) && test $(date +\%d) -gt 7; then
            logAndAlertDiscord "Day of month is >7; not removing $(basename $1)" $DISCORD_WEBHOOK_RESTRICTED_ALERTS
        else
            logAndAlertDiscord "Removing $(basename $1)" $DISCORD_WEBHOOK_RESTRICTED_ALERTS
            rm $1
        fi
    fi
}

# log and alert Discord with curl
logAndAlertDiscord() {
    echo "[$(date)] $1" | tee -a $LOGFILE
    WEBHOOK_URL=$2
    BODY="{\"content\":\"$1\"}"
    curl $WEBHOOK_URL -H 'Content-Type: application/json' -H "Content-Length: ${#BODY}" -d "$BODY"
}

logAndAlertDiscord "Wipe script initiated" $DISCORD_WEBHOOK_RESTRICTED_ALERTS

# shut down the instance
logAndAlertDiscord "Shutting down the server..." $DISCORD_WEBHOOK_RESTRICTED_ALERTS
docker compose -f $DOCKER_HOST_RDS_COMPOSE_FILE_PATH down && docker compose -f $DOCKER_HOST_AUX_COMPOSE_FILE_PATH down
SHUTDOWN_EXIT_CODE=$?
if [ $SHUTDOWN_EXIT_CODE -eq 0 ]; then
    logAndAlertDiscord "Instance shut down successfully" $DISCORD_WEBHOOK_RESTRICTED_ALERTS
else
    logAndAlertDiscord "Shutdown operation exited with code $SHUTDOWN_EXIT_CODE" $DISCORD_WEBHOOK_RESTRICTED_ALERTS
    exit $SHUTDOWN_EXIT_CODE
fi

# always generate new seed
logAndAlertDiscord "Generating new seed. Old seed was $(grep -oh "SEED=\w*" $ENVFILE)" $DISCORD_WEBHOOK_RESTRICTED_ALERTS
SEED=$((1 + RANDOM % 2147483647))
sed -i -E "s/RUST_SERVER_SEED=[[:digit:]]*$/RUST_SERVER_SEED=$SEED/" $ENVFILE
logAndAlertDiscord "New seed is $(grep -oh "SEED=\w*" $ENVFILE)" $DISCORD_WEBHOOK_RESTRICTED_ALERTS

# clean up data
if test -d $DOCKER_HOST_RDS_INSTANCE_DATA_DIRPATH; then
    for f in $(ls $DOCKER_HOST_RDS_INSTANCE_DATA_DIRPATH); do
        conditionallyRemoveDataFile $DOCKER_HOST_RDS_INSTANCE_DATA_DIRPATH/$f
    done
else
    echo "[$(date)] Cleanable data dir $DOCKER_HOST_RDS_INSTANCE_DATA_DIRPATH does not exist" 2>&1 | tee -a $LOGFILE
fi

# start up the instance
logAndAlertDiscord "Starting the Docker composition..." $DISCORD_WEBHOOK_RESTRICTED_ALERTS
docker compose -f $DOCKER_HOST_RDS_COMPOSE_FILE_PATH up -d --wait && docker compose -f $DOCKER_HOST_AUX_COMPOSE_FILE_PATH up -d
STARTUP_EXIT_CODE=$?
if [ $STARTUP_EXIT_CODE -eq 0 ]; then
    logAndAlertDiscord "Docker composition started." $DISCORD_WEBHOOK_RESTRICTED_ALERTS
else
    logAndAlertDiscord "Startup operation exited with code $STARTUP_EXIT_CODE" $DISCORD_WEBHOOK_RESTRICTED_ALERTS
    exit $STARTUP_EXIT_CODE
fi

docker exec reindeerland rcon rendermap

logAndAlertDiscord "Wipe procedure is done." $DISCORD_WEBHOOK_PUBLIC_BOT_ALERTS
