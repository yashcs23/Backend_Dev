const fs = require('fs');

fs.readFile('sample.txt', 'utf8', (err, data) => {
  if (err) throw err;
  const words = data.split(/\s+/).filter(word => word.length > 0);
  const count = words.length;
  fs.writeFile('count.txt', count.toString(), (err) => {
    if (err) throw err;
    console.log('Word count written to count.txt');
  });
});