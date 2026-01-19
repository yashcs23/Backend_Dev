const http = require('http');
const url = require('url');

let tasks = [];
let taskId = 1;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'POST' && pathname === '/tasks') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { title } = JSON.parse(body);
      const task = { id: taskId++, title, completed: false };
      tasks.push(task);
      res.writeHead(201);
      res.end(JSON.stringify(task));
    });
  } else if (req.method === 'GET' && pathname === '/tasks') {
    res.writeHead(200);
    res.end(JSON.stringify(tasks));
  } else if (req.method === 'GET' && pathname.startsWith('/tasks/')) {
    const id = parseInt(pathname.split('/')[2]);
    const task = tasks.find(t => t.id === id);
    if (task) {
      res.writeHead(200);
      res.end(JSON.stringify(task));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Task not found' }));
    }
  } else if (req.method === 'PUT' && pathname.startsWith('/tasks/')) {
    const id = parseInt(pathname.split('/')[2]);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { title, completed } = JSON.parse(body);
      const task = tasks.find(t => t.id === id);
      if (task) {
        task.title = title || task.title;
        task.completed = completed !== undefined ? completed : task.completed;
        res.writeHead(200);
        res.end(JSON.stringify(task));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Task not found' }));
      }
    });
  } else if (req.method === 'DELETE' && pathname.startsWith('/tasks/')) {
    const id = parseInt(pathname.split('/')[2]);
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      const deletedTask = tasks.splice(index, 1);
      res.writeHead(200);
      res.end(JSON.stringify(deletedTask[0]));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Task not found' }));
    }
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`TODO API server running on http://localhost:${PORT}`);
});