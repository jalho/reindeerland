import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import log4js from "log4js";

const API_KEY_HEADER_NAME = "x-ipinfo-apikey";
const IP_QP_NAME = "ip";

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

  // TODO: check cache first, and only query if not in cache
  // TODO: add ratelimiting; don't allow more than a small amount of requests per day

  const resolvedIp = await new Promise<{} | null>((resolve) => {
    const r = https.request(`https://ipinfo.io/${ip}?token=${apiKey}`);
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
    logg.info("Requesting from upstream...");
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
});
s.listen(PORT ?? 80, () => logg.info("Listening %s", s.address()));
