const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));

const contacts = [];

app.get('/contact', (req, res) => {
  res.render('contact-form');
});

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.render('contact-form', { error: 'All fields are required' });
  }
  
  contacts.push({ name, email, message, date: new Date() });
  res.render('contact-success', { name });
});

app.get('/contacts', (req, res) => {
  res.render('contacts-list', { contacts });
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/contact`);
});
