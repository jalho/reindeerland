import http from "node:http";
import fs from "node:fs";
import path from "node:path";

function setServableImage() {
    const files = fs.readdirSync(MAP_IMAGE_DIR_PATH);
    const fileName = files.find(f => f.match(mapImageRe));
    if (!fileName) return;
    else if (fileName !== currentlyServedImage) {
        currentlyServedImage = fileName;
        imageBuf = fs.readFileSync(path.join(MAP_IMAGE_DIR_PATH, currentlyServedImage));
        console.log("[%s] Now serving map image '%s'", new Date(), currentlyServedImage);
    }
}

const [, , PORT, MAP_IMAGE_DIR_PATH] = process.argv;

const stat = fs.statSync(MAP_IMAGE_DIR_PATH);
if (!stat.isDirectory()) {
    throw new Error(`Expected '${MAP_IMAGE_DIR_PATH}' to be a directory`);
}

// update image every 10 minutes
const mapImageRe = /\.png/;
let imageBuf = Buffer.alloc(0);
let currentlyServedImage = null;
setInterval(setServableImage, 1000 * 60 * 10);

const s = http.createServer((i, o) => {
    console.log("%s %s", i.method, i.url);
    o.end(imageBuf);
});
s.listen(PORT ?? 80, () => console.log(s.address()));
setServableImage();
