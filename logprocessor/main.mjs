import { watch, statSync, readFileSync, accessSync, watchFile, unwatchFile } from "node:fs";
import { open, readdir } from "node:fs/promises";
import { request } from "node:https";
import { join } from "node:path";

/**
 * Each item is used to index a JSON record of Discord webhooks.
 */
const expectedDiscordWebhooks = ["RESTRICTED_ALERTS", "PUBLIC_BOT_ALERTS", "GENERAL_CHAT"];

/**
 * The entry point.
 *
 * This program watches server logs written to a given logfile (path given as an argument) and then
 * sends alerts to Discord using its webhooks based on what the logs say.
 */
async function main() {
  const [, , logDir, discordWebhooksFilePath] = process.argv;
  try {
    if (!statSync(logDir).isDirectory()) {
      throw new Error(`Given log dir path '${logDir}' is not a directory!`);
    }
  } catch (eStat) {
    throw new Error("Expected RustDedicated logs dir path as the first arg", {
      cause: eStat,
    });
  }
  let hooks = null;
  try {
    if (!discordWebhooksFilePath.endsWith(".json")) throw new Error("Expected a JSON file");
    accessSync(discordWebhooksFilePath);
    hooks = JSON.parse(readFileSync(discordWebhooksFilePath).toString());
  } catch (cause) {
    throw new Error(`Given webhooks file (2nd arg) '${discordWebhooksFilePath}' is invalid`, { cause });
  }

  // assure all expected hooks are given as valid URLs
  for (const expectedWebhookEntry of expectedDiscordWebhooks) {
    try {
      new URL(hooks[expectedWebhookEntry]);
    } catch (eurl) {
      throw new Error(
        `Configured Discord webhook '${expectedWebhookEntry}' in '${discordWebhooksFilePath}' is missing or invalid!`,
        { cause: eurl }
      );
    }
    console.log("DEBUG: Using Discord webhook '%s': '%s'", expectedWebhookEntry, hooks[expectedWebhookEntry]);
  }

  // initially start watching latest pre-existing logfile
  let initialLogfile;
  for (const logFile of await readdir(logDir)) {
    const p = join(logDir, logFile);
    if (initialLogfile === undefined || statSync(p).mtime > statSync(initialLogfile).mtime) {
      initialLogfile = p;
    }
  }
  console.log("DEBUG: Latest logfile in dir '%s' is '%s'", logDir, initialLogfile);
  watchFile(initialLogfile, getTailReader(hooks, initialLogfile));

  // lifecycle; add or remove watcher of a logfile
  watch(logDir, async (event, fileName) => {
    const p = join(logDir, fileName);
    if (event === "rename" && fileName.endsWith(".txt")) {
      try {
        statSync(p);
        unwatchFile(initialLogfile);
        watchFile(p, getTailReader(hooks, p));
        await alertDiscord(hooks["RESTRICTED_ALERTS"], `New logfile '${fileName}' was created! Watching it now!`);
      } catch (_) {
        unwatchFile(p);
        await alertDiscord(hooks["RESTRICTED_ALERTS"], `Logfile '${fileName}' was removed! Not watching it anymore!`);
      }
    } else {
      console.log("DEBUG: Uninteresting fs event: '%s': '%s'", event, p);
    }
  });

  await alertDiscord(hooks["RESTRICTED_ALERTS"], "Logprocessor started!");
}

const getTailReader = (hooks, p) => async (curr, prev) => {
  // we only care about what gets appended to the end of the file
  if (curr.size === prev.size) {
    console.log(
    "DEBUG: file was changed but the size remained the same, thus not proceeding to process the change"
    );
    return;
  }

  const cleared = curr.size - prev.size < 0;
  if (cleared) {
    console.log("DEBUG: logfile was cleared, thus reading all");
    await readn(p, 0, curr.size, getLogBufHandler(hooks));
  } else {
    await readn(p, prev.size, curr.size - prev.size, getLogBufHandler(hooks));
  }
  } 

/**
 * Read _n_ bytes from a given file, and pass the read data to a given (possibly async) callback.
 */
async function readn(path, position, length, cb) {
  if (typeof cb !== "function") throw new Error(`Expected the arg 'cb' to be a function, but got '${typeof cb}'`);
  if (length < 0) throw new Error(`Attempted to read ${length} bytes`);

  let fh;
  try {
    fh = await open(path, "r");
  } catch (efsopen) {
    console.log("DEBUG: cannot open '%s'", path);
  }
  if (fh === undefined) return;

  const readd = await fh.read({
    buffer: Buffer.alloc(length),
    length,
    position,
  });
  console.log("DEBUG: read %d bytes, passing to callback", readd.bytesRead);
  await cb(readd.buffer);
  fh.close();
}

const getLogBufHandler = (hooks) => async (buf) => {
  if (!Buffer.isBuffer(buf)) throw new Error("Expected arg 'buf' to be a buffer!");

  let loglines;
  try {
    loglines = buf.toString("utf8");
  } catch (edec) {
    console.log("DEBUG: cannot decode the logdata");
    return;
  }
  if (loglines === undefined) return;

  const trlines = loglines.split("\n").map((l) => l.trim());
  for (const ln of trlines) {
    if (typeof ln !== "string" || ln.length < 1 || ln.startsWith("[CHAT]")) {
      continue;
    }
    for (const h of lnhandlers) {
      const mgroup = ln.match(h.matcher);
      if (Array.isArray(mgroup)) {
        console.log("DEBUG: using handler '%s'", h.description);
        await h.handler(mgroup, { hooks });
      }
    }
  }
};

/**
 * List of handlers from where a handler function for each processable log line is
 * chosen.
 */
const lnhandlers = [
  {
    description: "Bradley spawn",
    matcher: new RegExp("bradleyapc spawned", "i"),
    handler: (mgroup) => console.log("Bradley spawned"),
  },
  {
    description: "PVP event",
    /**
     * 17 digit SteamIDs of two players in square brackets.
     *
     * @example
     * "Biimeri-Elias[76561199203765129] was killed by SUMEA[76561199068741221] at (390.2, 59.4, -808.4)"
     */
    matcher: new RegExp("^(.+)\\[(\\d{17})\\] was killed by (.+)\\[(\\d{17})\\]"),
    handler: async (mgroup, opts) => {
      const { hooks } = opts;
      const [, killedname, killedid, killername, killerid] = mgroup;
      const alertmsg = `${killername} killed ${killedname}`;
      console.log("DEBUG: alerting Discord with message '%s'", alertmsg);
      await alertDiscord(hooks["RESTRICTED_ALERTS"], alertmsg);
    },
  },
  {
    description: "PVE event",
    /**
     * 17 digit SteamID of a player in square brackets and a killer animal
     * (which is not followed by another SteamID).
     *
     * @example
     * "Deto[76561198253712237] was killed by wolf (Wolf) at (-1202.1, 10.4, 628.7)"
     */
    matcher: new RegExp("^(.+)\\[(\\d{17})\\] was killed by ([a-z]+)(?!.*\\[\\d{17}\\] at)"),
    handler: async (mgroup, opts) => {
      const { hooks } = opts;
      const [, killedname, killedid, killername, killerid] = mgroup;
      const alertmsg = `PvE: ${killername} killed ${killedname}`;
      console.log("DEBUG: alerting Discord with message '%s'", alertmsg);
      await alertDiscord(hooks["RESTRICTED_ALERTS"], alertmsg);
    },
  },
  {
    description: "player joined #1",
    /**
     * Player name and 17 digit SteamID followed by an IP and port.
     *
     * @example
     * "Anneli Bauer with steamid 76561198119178361 joined from ip 84.251.205.153:52685"
     */
    matcher: new RegExp("^(.+) with steamid \\d{17} joined"),
    handler: async (mgroup, opts) => {
      const { hooks } = opts;
      const [, playername] = mgroup;
      const alertmsg = `${playername} joined the server`;
      console.log("DEBUG: alerting Discord with message '%s'", alertmsg);
      await alertDiscord(hooks["PUBLIC_BOT_ALERTS"], alertmsg);
    },
  },
  {
    description: "player joined #2",
    /**
     * Address, Steam ID and player name separated with slashes.
     *
     * @example
     * "14842:88.196.8.154:53761/76561197985995177/Herr. Fritzl joined [windows/76561197985995177]"
     */
    matcher: new RegExp("^.+/\\d{17}/(.+) joined"),
    handler: async (mgroup, opts) => {
      const { hooks } = opts;
      const [, playername] = mgroup;
      const alertmsg = `${playername} joined the server`;
      console.log("DEBUG: alerting Discord with message '%s'", alertmsg);
      await alertDiscord(hooks["PUBLIC_BOT_ALERTS"], alertmsg);
    },
  },
  {
    description: "Bradley spawned",
    /**
     * BradleyAPC (NPC) spawn at a location.
     *
     * @example
     * "BradleyAPC Spawned at :(88.7, 33.1, 605.0)"
     */
    matcher: new RegExp("^BradleyAPC Spawned.*"),
    handler: async (mgroup, opts) => {
      const { hooks } = opts;
      const alertmsg = "Bradley spawned!";
      console.log("DEBUG: alerting Discord with message '%s'", alertmsg);
      await alertDiscord(hooks["PUBLIC_BOT_ALERTS"], alertmsg);
    },
  },
];

/**
 * Send an alert to Discord via a given webhook.
 */
async function alertDiscord(webhook, content) {
  const webhookurl = new URL(webhook);
  const r = request({
    host: webhookurl.host,
    path: webhookurl.pathname,
    method: "POST",
  });
  const serializedpayload = Buffer.from(JSON.stringify({ content }));
  r.setHeader("Content-Length", serializedpayload.length);
  r.setHeader("Content-Type", "application/json");
  r.write(serializedpayload);
  r.end(() => {
    console.log("DEBUG: sent '%s' alert to '%s'", content, webhookurl.host);
  });
  return new Promise((resolve) => {
    r.on("response", (incoming) => {
      console.log("DEBUG: got response with statuscode %d", incoming.statusCode);
      resolve();
    });
  });
}

main();
