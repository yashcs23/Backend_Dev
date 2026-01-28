const os = require("os");
const fs = require("fs");

const logFile = "system.log";

const SystemInfo = () => {
  const totalMemory = os.totalmem() / (1024 * 1024 * 1024);
  const freeMemory = os.freemem() / (1024 * 1024 * 1024);
  const info = `
Platform: ${os.platform()}
Uptime (hours): ${os.uptime() / 3600}
CPU Model: ${os.cpus()[0].model}
Total Memory (GB): ${totalMemory}
Free Memory (GB): ${freeMemory}
Timestamp: ${new Date().toLocaleString()}
---`;

  console.log(info);
  fs.appendFileSync(logFile, info + "\n");
};

setInterval(SystemInfo, 5000);
