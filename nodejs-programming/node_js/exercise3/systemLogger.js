const os = require('os');
const fs = require('fs');

const logSystemInfo = () => {
  const info = {
    timestamp: new Date().toISOString(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime()
  };

  const logEntry = JSON.stringify(info) + '\n';
  fs.appendFile('system-log.txt', logEntry, (err) => {
    if (err) console.error(err);
  });
};

console.log('System information logger started. Logging every 5 seconds...');
setInterval(logSystemInfo, 5000);

process.on('SIGINT', () => {
  console.log('\nLogger stopped.');
  process.exit(0);
});