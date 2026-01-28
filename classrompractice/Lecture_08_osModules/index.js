const os = require("os")

const totalMemory = os.totalmem()/(1024*1024*1024);

const freeMemory = os.freemem()/(1024*1024*1024);
console.log(os.platform())
console.log(os.uptime()/(3600));
console.log(os.cpus()[0].model);

console.log(totalMemory,freeMemory);