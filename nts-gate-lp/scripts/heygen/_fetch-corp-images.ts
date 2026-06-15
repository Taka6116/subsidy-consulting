import * as fs from "fs";
import * as path from "path";

const urls = [
  "https://nihon-teikei.co.jp/wp-content/themes/nihonteikei/assets/images/top-fv-img01.webp",
  "https://nihon-teikei.co.jp/wp-content/themes/nihonteikei/assets/images/top-fv-img02.webp",
  "https://nihon-teikei.co.jp/wp-content/themes/nihonteikei/assets/images/top-fv-img03.webp",
  "https://nihon-teikei.co.jp/wp-content/themes/nihonteikei/assets/images/top-message-cover.webp",
];

async function main() {
  const outDir = path.join(__dirname, "output");
  for (const u of urls) {
    const name = u.split("/").pop()!;
    const r = await fetch(u);
    if (!r.ok) {
      console.log(name, "FAILED", r.status);
      continue;
    }
    const b = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(path.join(outDir, name), b);
    console.log(name, (b.length / 1024).toFixed(0) + "KB");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
