const express = require('express');
const fs = require('fs');
const uuid = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// HTML Routes
app.get('/notes', (req, res) => {
  res.sendFile(__dirname + '/public/notes.html');
});


// API Routes
app.get('/api/notes', (req, res) => {
    fs.readFile('./db.json', 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // If the file doesn't exist, return an empty array as JSON.
          res.json([]);
        } else {
          // Handle other errors (e.g., file read error).
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      } else {
        // Parse and send the data as JSON.
        const notes = JSON.parse(data);
        res.json(notes);
      }
    });
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  });

  app.post('/api/notes', (req, res) => {
    fs.readFile('./db.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading db.json:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      try {
        const notes = JSON.parse(data);
        const newNote = {
          id: uuid.v4(),
          title: req.body.title,
          text: req.body.text,
        };
  
        notes.push(newNote);
  
        fs.writeFile('./db.json', JSON.stringify(notes), (err) => {
          if (err) {
            console.error('Error writing db.json:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }
  
          res.json(newNote);
        });
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        res.status(400).json({ error: 'Invalid JSON data' });
      }
    });
  });

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});