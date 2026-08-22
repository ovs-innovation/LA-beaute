const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const src = path.join(__dirname, "..", "assets", "images", "logo.png");
const dest = path.join(__dirname, "..", "assets", "images", "logo.png");
const backup = path.join(__dirname, "..", "assets", "images", "logo-original.png");

const png = PNG.sync.read(fs.readFileSync(src));
const { width, height, data } = png;

if (!fs.existsSync(backup)) {
  fs.copyFileSync(src, backup);
}

function idx(x, y) {
  return (y * width + x) * 4;
}

function isBg(x, y) {
  const i = idx(x, y);
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max < 38 && max - min < 18;
}

const seen = new Uint8Array(width * height);
const q = [];
function push(x, y) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const k = y * width + x;
  if (seen[k]) return;
  if (!isBg(x, y)) return;
  seen[k] = 1;
  q.push(k);
}

for (let x = 0; x < width; x++) {
  push(x, 0);
  push(x, height - 1);
}
for (let y = 0; y < height; y++) {
  push(0, y);
  push(width - 1, y);
}

while (q.length) {
  const k = q.pop();
  const x = k % width;
  const y = (k - x) / width;
  const i = idx(x, y);
  data[i + 3] = 0;
  push(x + 1, y);
  push(x - 1, y);
  push(x, y + 1);
  push(x, y - 1);
}

// soften leftover dark fringe
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = idx(x, y);
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    if (max < 28) {
      data[i + 3] = 0;
    } else if (max < 55 && Math.max(r, g, b) - Math.min(r, g, b) < 12) {
      data[i + 3] = Math.min(data[i + 3], 90);
    }
  }
}

fs.writeFileSync(dest, PNG.sync.write(png));
console.log("wrote transparent logo", width, height);
