const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if ( req.url === '/complain') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { name, issue, priority } = JSON.parse(body);

        if (!name || !issue || !priority) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Missing required fields: name, issue, priority' }));
          return;
        }

        const ticketId = 'TKT-' + Math.random().toString(36).substring(2, 9).toUpperCase();

        const logEntry = `Ticket ID: ${ticketId}\nName: ${name}\nIssue: ${issue}\nPriority: ${priority}\nDate: ${new Date().toISOString()}\n${'='.repeat(50)}\n`;

        const filename = priority.toLowerCase() === 'high' ? 'URGENT.txt' : 'normal_complaints.txt';

        fs.appendFile(filename, logEntry, (err) => {
          if (err) {
            console.error('Error writing to file:', err);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to log complaint' }));
            return;
          }

          res.writeHead(200);
          res.end(JSON.stringify({
            ticketId: ticketId,
            message: 'We will solve your issue soon.'
          }));
        });
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

server.listen(8000, () => {
  console.log(`Server running on port 8000`);
});
