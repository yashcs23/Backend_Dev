const express = require('express');
const app = express();

const users = [
  { id: 1, name: 'Rajesh Kumar' },
  { id: 2, name: 'Priya Sharma' },
  { id: 3, name: 'Arjun Singh' },
  { id: 4, name: 'Anaya Patel' }
];

app.get('/users', (req, res) => {
  const name = req.query.name;
  
  if (!name) {
    return res.json(users);
  }
  
  const filtered = users.filter(user => 
    user.name.toLowerCase().includes(name.toLowerCase())
  );
  
  res.json(filtered);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Test: http://localhost:${PORT}/users`);
  console.log(`Test: http://localhost:${PORT}/users?name=john`);
});
