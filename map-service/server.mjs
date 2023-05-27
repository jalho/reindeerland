import http from "node:http";
import fs from "node:fs";

const s = http.createServer((i, o) => {
    console.log("%s %s", i.method, i.url);
    o.end(fs.readFileSync("map_4500_21232.png")); // TODO: find map file automatically from workdir
});
s.listen(80, () => console.log(s.address()));
