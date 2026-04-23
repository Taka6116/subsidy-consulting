import archiver from "archiver";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "function.zip");

if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

const output = fs.createWriteStream(outPath);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  console.log(`ZIP created: ${archive.pointer()} bytes → ${outPath}`);
});
archive.on("error", (err) => { throw err; });
archive.pipe(output);

archive.file(path.join(__dirname, "index.mjs"), { name: "index.mjs" });
archive.file(path.join(__dirname, "package.json"), { name: "package.json" });
archive.directory(path.join(__dirname, "node_modules"), "node_modules");

archive.finalize();
