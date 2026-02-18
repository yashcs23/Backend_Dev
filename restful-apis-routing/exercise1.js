const express = require('express');
const app = express();

app.use(express.json());

let books = [
  { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925 },
  { id: 2, title: '1984', author: 'George Orwell', year: 1949 },
  { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960 }
];

let nextId = 4;

app.get('/books', (req, res) => {
  let filteredBooks = [...books];

  if (req.query.author) {
    filteredBooks = filteredBooks.filter(book => 
      book.author.toLowerCase().includes(req.query.author.toLowerCase())
    );
  }

  if (req.query.year) {
    const year = parseInt(req.query.year);
    if (!isNaN(year)) {
      filteredBooks = filteredBooks.filter(book => book.year === year);
    }
  }

  res.json(filteredBooks);
});

app.get('/books/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

app.post('/books', (req, res) => {
  const { title, author, year } = req.body;

  if (!title || !author || year === undefined) {
    return res.status(400).json({ error: 'Title, author, and year are required' });
  }

  const newBook = {
    id: nextId++,
    title,
    author,
    year
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

app.put('/books/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ error: 'Book not found' });

  if (req.body.title) book.title = req.body.title;
  if (req.body.author) book.author = req.body.author;
  if (req.body.year !== undefined) book.year = req.body.year;

  res.json(book);
});

app.delete('/books/:id', (req, res) => {
  const index = books.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Book not found' });

  const deletedBook = books.splice(index, 1);
  res.json(deletedBook[0]);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
