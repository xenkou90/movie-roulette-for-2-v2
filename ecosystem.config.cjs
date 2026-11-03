const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// PM2 runs on the server's default Node. This app runs on the version pinned in
// .nvmrc, so its Node binary is found here and given to PM2 directly.
function nodeFromNvmrc() {
  const major = fs.readFileSync(path.join(__dirname, ".nvmrc"), "utf8").trim();
  const nvmDir = process.env.NVM_DIR ?? path.join(os.homedir(), ".nvm");
  const versionsDir = path.join(nvmDir, "versions", "node");

  const newest = fs
    .readdirSync(versionsDir)
    .filter((name) => name.startsWith(`v${major}.`))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .at(-1);

  if (newest === undefined) {
    throw new Error(`Node ${major} isn't installed. Run: nvm install ${major}`);
  }

  return path.join(versionsDir, newest, "bin", "node");
}

module.exports = {
  apps: [
    {
      name: "movie-roulette",
      cwd: path.join(__dirname, "server"),
      script: nodeFromNvmrc(),
      args: "--env-file=.env dist/index.js",
      interpreter: "none",
      max_memory_restart: "300M",
      kill_timeout: 7000,
      time: true,
    },
  ],
};
