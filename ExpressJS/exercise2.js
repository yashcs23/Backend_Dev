const express = require('express');
const app = express();

const responseTimeMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  
  next();
};

app.use(responseTimeMiddleware);

app.get('/', (req, res) => {
  setTimeout(() => {
    res.send('Home Page');
  }, 100);
});

app.get('/about', (req, res) => {
  setTimeout(() => {
    res.send('About Page');
  }, 200);
});

app.get('/fast', (req, res) => {
  res.send('Fast Response');
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
