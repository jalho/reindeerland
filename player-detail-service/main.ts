import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import log4js from "log4js";

const API_KEY_HEADER_NAME = "x-ipinfo-apikey";
const IP_QP_NAME = "ip";
const MAX_UPSTREAM_QUERIES_PER_DAY = 500; // the free ipinfo API allows 50k per month or something

const logg = log4js
  .configure({
    appenders: {
      stdout: {
        type: "stdout",
      },
    },
    categories: { default: { appenders: ["stdout"], level: "all" } },
  })
  .getLogger();

const [, , PORT, STORE_FILE_PATH] = process.argv;
fs.accessSync(STORE_FILE_PATH, fs.constants.R_OK);
fs.accessSync(STORE_FILE_PATH, fs.constants.W_OK);
logg.info("Store file '%s' is OK: readable & writeable", STORE_FILE_PATH);

let dailyRequestsMade = 0;
setInterval(() => {
  const old = dailyRequestsMade;
  dailyRequestsMade = 0;
  logg.info("Daily requests counter reset -- was %d", old);
}, 1000 * 60 * 60 * 24);

const s = http.createServer(async (i, o) => {
  logg.info("[%s] [%s] [%s]", new Date(), i.method, i.url);

  const apiKey = i.headers[API_KEY_HEADER_NAME];
  if (typeof apiKey !== "string" || !apiKey) {
    o.statusCode = 400;
    logg.warn("Expected header '%s' (to use ipinfo.io)", API_KEY_HEADER_NAME);
    o.end();
    return;
  }

  const _url = new URL(i.url ?? "", "http://localhost");
  const ip = _url.searchParams.get(IP_QP_NAME);
  if (!ip) {
    o.statusCode = 400;
    logg.warn("Expected query param '%s'", IP_QP_NAME);
    o.end();
    return;
  }

  // check disk cache first, and only query if not in cache
  let cached;
  try {
    cached = JSON.parse(fs.readFileSync(STORE_FILE_PATH).toString());
  } catch (err_json) {
    if (fs.statSync(STORE_FILE_PATH).size !== 0) {
      throw new Error(`Store file '${STORE_FILE_PATH}' is not JSON and also not empty! Did you give the correct file?`);
    }
    cached = {}; // case empty file -- init cache
  }
  if (cached[ip]) {
    o.setHeader("Content-Type", "application/json");
    o.write(Buffer.from(JSON.stringify(cached[ip])));
    o.end();
    return;
  } else logg.info("No cached IP info found -- proceeding to query upstream!");

  // ratelimiting; don't allow more than a small amount of requests per day
  if (dailyRequestsMade >= MAX_UPSTREAM_QUERIES_PER_DAY) {
    o.statusCode = 429;
    logg.warn("Max number of requests made for today (%d/%d)", dailyRequestsMade, MAX_UPSTREAM_QUERIES_PER_DAY);
    o.end();
    return;
  }

  const resolvedIp = await new Promise<{} | null>((resolve) => {
    const r = https.request(`https://ipinfo.io/${ip}?token=${apiKey}`);
    dailyRequestsMade++;
    r.on("error", (error) => {
      logg.error(error);
      return resolve(null);
    });
    r.on("response", (incMsg) => {
      if (incMsg.statusCode !== 200) {
        logg.error("Upstream responded with not OK status %d %s", incMsg.statusCode, incMsg.statusMessage);
        return resolve(null);
      }
      const bufs: Buffer[] = [];
      incMsg.on("data", (buf) => bufs.push(buf));
      incMsg.on("end", () => {
        return resolve(JSON.parse(Buffer.concat(bufs).toString()));
      });
    });
    r.end();
    logg.info("Requesting from upstream (req no #%d for today)...", dailyRequestsMade);
  });
  logg.info("Got response %o", resolvedIp);

  if (!resolvedIp) {
    o.statusCode = 500;
    logg.warn("Could not resolve IP with upstream");
    o.end();
    return;
  }

  // case all good
  o.setHeader("Content-Type", "application/json");
  o.write(Buffer.from(JSON.stringify(resolvedIp)));
  o.end();
  // store in disk cache
  cached[ip] = resolvedIp;
  fs.writeFileSync(STORE_FILE_PATH, Buffer.from(JSON.stringify(cached, null, 2)));
  logg.info("Cached info for the queried IP");
});
s.listen(PORT ?? 80, () => logg.info("Listening %s", s.address()));
