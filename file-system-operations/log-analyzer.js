const fs = require('fs');
const readline = require('readline');

const logFile = process.argv[2] || 'sample.log';

if (!fs.existsSync(logFile)) {
  console.error('Log file not found');
  process.exit(1);
}

let total = 0;
let errors = 0;
let warnings = 0;
let info = 0;

const rl = readline.createInterface({
  input: fs.createReadStream(logFile),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  total++;

  if (line.includes('ERROR')) errors++;
  else if (line.includes('WARN')) warnings++;
  else if (line.includes('INFO')) info++;
});

rl.on('close', () => {
  console.log('\n=== Log Report ===');
  console.log('Total lines:', total);
  console.log('Errors:', errors);
  console.log('Warnings:', warnings);
  console.log('Info:', info);
});
