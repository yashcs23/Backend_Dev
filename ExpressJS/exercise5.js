const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const images = [
  { id: 1, name: 'Sunset', filename: 'sunset.jpg', description: 'Beautiful sunset' },
  { id: 2, name: 'Mountain', filename: 'mountain.jpg', description: 'Majestic mountain' },
  { id: 3, name: 'Forest', filename: 'forest.jpg', description: 'Dense forest' },
  { id: 4, name: 'Ocean', filename: 'ocean.jpg', description: 'Blue ocean' },
  { id: 5, name: 'Desert', filename: 'desert.jpg', description: 'Sandy desert' }
];

app.get('/gallery', (req, res) => {
  res.render('gallery', { images });
});

app.get('/gallery/:id', (req, res) => {
  const image = images.find(img => img.id === parseInt(req.params.id));
  
  if (!image) {
    return res.status(404).send('Image not found');
  }
  
  res.render('image-detail', { image });
});

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/gallery`);
});
