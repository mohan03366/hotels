const fs = require("fs");
const path = require("path");

// Clear ESLint cache
const cacheDir = path.join(
  __dirname,
  "node_modules",
  ".cache",
  "eslint-loader"
);
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log("ESLint cache cleared successfully");
} else {
  console.log("No ESLint cache found");
}

// Clear any other cache directories
const otherCacheDirs = [
  path.join(__dirname, "node_modules", ".cache"),
  path.join(__dirname, ".eslintcache"),
];

otherCacheDirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`Cleared cache directory: ${dir}`);
  }
});

console.log("Cache clearing completed");
