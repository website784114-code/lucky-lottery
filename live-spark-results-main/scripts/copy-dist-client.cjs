const fs = require("fs");
const path = require("path");

const sourceDir = path.join(process.cwd(), "dist", "client");
const targetDir = path.join(process.cwd(), "public");

function copyFolder(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Source folder not found: ${src}`);
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".assetsignore") continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyFolder(srcPath, destPath);
      continue;
    }

    fs.copyFileSync(srcPath, destPath);
  }
}

copyFolder(sourceDir, targetDir);
console.log(`Copied client build assets from ${sourceDir} to ${targetDir}`);
