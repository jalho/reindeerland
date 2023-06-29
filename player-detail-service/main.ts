import http from "node:http";

const [, , PORT] = process.argv;
const s = http.createServer((i, o) => {
  console.log("[%s] [%s] [%s]", new Date(), i.method, i.url);
  o.end();
});
s.listen(PORT ?? 80, () => console.log("Listening %s", s.address()));
