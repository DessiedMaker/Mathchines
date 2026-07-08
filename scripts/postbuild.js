import fs from "fs";
import path from "path";

const clientDir = path.resolve("dist", "client");
const shellPath = path.join(clientDir, "_shell.html");
const indexPath = path.join(clientDir, "index.html");
const fallbackPath = path.join(clientDir, "404.html");

function run() {
  if (!fs.existsSync(shellPath)) {
    console.error(`Postbuild Error: Vinxi shell not found at ${shellPath}`);
    process.exit(1);
  }

  try {
    fs.copyFileSync(shellPath, indexPath);
    console.log(`Successfully copied ${shellPath} to ${indexPath}`);
    
    fs.copyFileSync(shellPath, fallbackPath);
    console.log(`Successfully copied ${shellPath} to ${fallbackPath}`);
  } catch (err) {
    console.error("Postbuild Error during file copy:", err);
    process.exit(1);
  }
}

run();
