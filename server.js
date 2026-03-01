const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Connect to database
const db = new sqlite3.Database('./database/university.db');


// GET all courses
app.get('/api/courses', (req, res) => {
    db.all('SELECT * FROM courses', (err, rows) => {
        res.json(rows);
    });
});


// GET single course
app.get('/api/courses/:id', (req, res) => { 
    const id = req.params.id; 
    db.get('SELECT * FROM courses WHERE id = ?', [id], (err, row) => { 
        res.json(row); 
    }); 
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})