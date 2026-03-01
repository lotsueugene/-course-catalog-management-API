const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;


//Request logger
const requestLogger = (req, res, next) => {
    const timeStamp = new Date().toISOString();
    console.log(`[${timeStamp}] ${req.method} ${req.originalUrl}`)

    if(req.method === "POST" || req.method === "PUT") {
        console.log("Request Body", JSON.stringify(req.body, null, 2))
    }

    next()
};


// Built-in middleware for parsing JSON
app.use(express.json());

// Custom logging middleware
app.use(requestLogger);

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


//Add new course
app.post('/api/courses', (req, res) => { 
    const { courseCode, title, credits, description, semester } = req.body; 

    db.run(
        `INSERT INTO courses (courseCode, title, credits, description, semester)
         VALUES (?, ?, ?, ?, ?)`,
        [courseCode, title, credits, description, semester], 
        function (err) { 
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({ 
                message: "Course created successfully",
                id: this.lastID 
            }); 
        }
    ); 
});


//PUT | Update an existing course
app.put('/api/courses/:id', (req, res) => { 
    const id = req.params.id; 

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({
            error: 'Invalid course ID. ID must be a positive number.'
        });
    }

    const { courseCode, title, credits, description, semester } = req.body; 

    db.run(` UPDATE courses SET courseCode = ?, title = ?, credits = ?, description = ?, semester = ? WHERE id = ? 
        `, [courseCode, title, credits, description, semester, id], 
        function(err) { 
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: 'Course not found' });
            }
            res.json({ message: 'Course updated' }); 
        }
    ); 
});


//DELETE
app.delete('/api/courses/:id', (req, res) => {
    const id = req.params.id;

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({
            error: 'Invalid course ID. ID must be a positive number.'
        });
    }

    db.run('DELETE FROM courses WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({ message: 'Course deleted successfully' });
    });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})