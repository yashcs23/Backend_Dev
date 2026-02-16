const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

let posts = [
  { 
    id: 1, 
    title: 'First Post', 
    content: 'This is the first blog post', 
    author: 'John',
    date: new Date('2024-01-15')
  },
  { 
    id: 2, 
    title: 'Second Post', 
    content: 'This is the second blog post', 
    author: 'Jane',
    date: new Date('2024-01-20')
  },
  { 
    id: 3, 
    title: 'Third Post', 
    content: 'This is the third blog post', 
    author: 'Bob',
    date: new Date('2024-01-25')
  }
];

let nextId = 4;

app.get('/blog', (req, res) => {
  res.render('blog-list', { posts });
});

app.get('/blog/new', (req, res) => {
  res.render('blog-new');
});

app.post('/blog', (req, res) => {
  const { title, content, author } = req.body;
  
  if (!title || !content || !author) {
    return res.render('blog-new', { error: 'All fields are required' });
  }
  
  posts.push({
    id: nextId++,
    title,
    content,
    author,
    date: new Date()
  });
  
  res.redirect('/blog');
});

app.get('/blog/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  
  if (!post) {
    return res.status(404).send('Post not found');
  }
  
  res.render('blog-detail', { post });
});

const PORT = 3006;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/blog`);
});
