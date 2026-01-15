import { PMTiles } from "pmtiles";
import fs from "fs";

class NodeFileSource {
    constructor(path) {
        this.path = path;
        this.fd = fs.openSync(path, 'r');
        this.size = fs.statSync(path).size;
    }
    async getBytes(offset, length) {
        const buffer = Buffer.alloc(length);
        fs.readSync(this.fd, buffer, 0, length, offset);
        return { data: buffer.buffer }; // Return ArrayBuffer
    }
    getKey() { return this.path; }
}

async function run() {
    const source = new NodeFileSource('public/my_dem.pmtiles');
    const p = new PMTiles(source);

    try {
        const header = await p.getHeader();
        console.log("Header:", header);

        const metadata = await p.getMetadata();
        console.log("Metadata:", metadata);
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
