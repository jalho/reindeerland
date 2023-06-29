import http from "node:http";
import fs from "node:fs";
import log4js from "log4js";

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

const s = http.createServer((i, o) => {
  console.log("[%s] [%s] [%s]", new Date(), i.method, i.url);
  o.end();
});
s.listen(PORT ?? 80, () => logg.info("Listening %s", s.address()));
