const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const path = require('path');
const multer = require('multer'); 
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_jwt_secret_key_very_secret'; 

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const uploadDir = path.join(__dirname, 'uploads/avatars');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {

        const userId = req.user && req.user.userId ? req.user.userId : 'anonymous';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, userId + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
}

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ message: 'A user with that username already exists.' });
                }
                console.error('Error during registration:', err.message);
                return res.status(500).json({ message: 'Server error during registration.' });
            }
            const userId = this.lastID;
          
            db.serialize(() => {
                db.run('INSERT INTO categories (user_id, name) VALUES (?, ?)', [userId, 'Work'], (err) => {
                    if (err) console.error('Error adding default "Work" category:', err.message);
                });
                db.run('INSERT INTO categories (user_id, name) VALUES (?, ?)', [userId, 'Home'], (err) => {
                    if (err) console.error('Error adding default "Home" category:', err.message);
                });
                db.run('INSERT INTO categories (user_id, name) VALUES (?, ?)', [userId, 'Personal'], (err) => {
                    if (err) console.error('Error adding default "Personal" category:', err.message);
                });
            });
            res.status(201).json({ message: 'User registered successfully!', userId: userId });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ message: 'Server error during password hashing.' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            console.error('Error during login query:', err.message);
            return res.status(500).json({ message: 'Server error during login.' });
        }
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        const accessToken = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ accessToken: accessToken, username: user.username, message: 'Logged in successfully!' });
    });
});


app.get('/user/profile', authenticateToken, (req, res) => {
    if (!req.user || !req.user.userId) {
        return res.status(400).json({ message: 'User ID not found in token.' });
    }

    let userProfile = {};
    db.get('SELECT id, username, avatar_url FROM users WHERE id = ?', [req.user.userId], (err, user) => {
        if (err) {
            console.error('Error fetching user details from DB:', err.message);
            return res.status(500).json({ message: 'Server error fetching user details.' });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        userProfile = { ...user };

        db.get('SELECT COUNT(id) AS totalTasks FROM tasks WHERE user_id = ?', [req.user.userId], (err, taskStats) => {
            if (err) {
                console.error('Error fetching total task stats from DB:', err.message);
                return res.status(500).json({ message: 'Server error fetching total task stats.' });
            }
            userProfile.totalTasks = taskStats ? taskStats.totalTasks : 0;
            res.json(userProfile);
        });
    });
});

app.post('/user/avatar', authenticateToken, upload.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    db.run('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.user.userId], function (err) {
        if (err) {
            console.error('Error updating avatar in database:', err.message);
            return res.status(500).json({ message: 'Error updating database.' });
        }
        res.json({ message: 'Avatar updated successfully', avatarUrl: avatarUrl });
    });
});

app.get('/categories', authenticateToken, (req, res) => {
    db.all('SELECT id, name FROM categories WHERE user_id = ? ORDER BY name ASC', [req.user.userId], (err, categories) => {
        if (err) {
            console.error('Error fetching categories:', err.message);
            return res.status(500).json({ message: 'Server error fetching categories.' });
        }
        res.json(categories);
    });
});

app.post('/categories', authenticateToken, (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Category name is required.' });
    }
    db.run('INSERT INTO categories (user_id, name) VALUES (?, ?)', [req.user.userId, name], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ message: 'Category with that name already exists.' });
            }
            console.error('Error adding category:', err.message);
            return res.status(500).json({ message: 'Server error adding category.' });
        }
        res.status(201).json({ message: 'Category added successfully!', categoryId: this.lastID, name: name });
    });
});

app.put('/categories/:id', authenticateToken, (req, res) => {
    const categoryId = req.params.id;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Category name is required.' });
    }
    db.run('UPDATE categories SET name = ? WHERE id = ? AND user_id = ?', [name, categoryId, req.user.userId], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ message: 'Category with that name already exists.' });
            }
            console.error('Error updating category:', err.message);
            return res.status(500).json({ message: 'Server error updating category.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Category not found or unauthorized.' });
        }
        res.json({ message: 'Category updated successfully!' });
    });
});

app.delete('/categories/:id', authenticateToken, (req, res) => {
    const categoryId = req.params.id;
    db.run('DELETE FROM categories WHERE id = ? AND user_id = ?', [categoryId, req.user.userId], function(err) {
        if (err) {
            console.error('Error deleting category:', err.message);
            return res.status(500).json({ message: 'Server error deleting category.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Category not found or unauthorized.' });
        }

        res.json({ message: 'Category deleted successfully!' });
    });
});



app.get('/tasks', authenticateToken, (req, res) => {
    const { categoryId } = req.query;

    let sql = `SELECT tasks.*, categories.name AS category_name FROM tasks
               LEFT JOIN categories ON tasks.category_id = categories.id
               WHERE tasks.user_id = ?`;
    const params = [req.user.userId];

    if (categoryId && categoryId !== 'all') {
        sql += ` AND tasks.category_id = ?`;
        params.push(categoryId);
    } else if (categoryId === 'null') {
        sql += ` AND tasks.category_id IS NULL`;
    }

    sql += ` ORDER BY
                CASE tasks.priority
                    WHEN 'High' THEN 1
                    WHEN 'Medium' THEN 2
                    WHEN 'Low' THEN 3
                    ELSE 4
                END,
                tasks.deadline ASC`;

    db.all(sql, params, (err, tasks) => {
        if (err) {
            console.error('Error fetching tasks:', err.message);
            return res.status(500).json({ message: 'Server error fetching tasks.' });
        }
        res.json(tasks);
    });
});

app.get('/tasks/:id', authenticateToken, (req, res) => {
    const taskId = req.params.id;
    db.get('SELECT tasks.*, categories.name AS category_name FROM tasks LEFT JOIN categories ON tasks.category_id = categories.id WHERE tasks.id = ? AND tasks.user_id = ?', [taskId, req.user.userId], (err, task) => {
        if (err) {
            console.error('Error fetching single task:', err.message);
            return res.status(500).json({ message: 'Server error fetching task.' });
        }
        if (!task) {
            return res.status(404).json({ message: 'Task not found or unauthorized.' });
        }
        res.json(task);
    });
});

app.post('/tasks', authenticateToken, (req, res) => {
    const { title, description, deadline, priority, status, category_id } = req.body;
    if (!title) {
        return res.status(400).json({ message: 'Task title is required.' });
    }
    const taskStatus = status || 'To Do';

    db.run('INSERT INTO tasks (user_id, category_id, title, description, deadline, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.userId, category_id || null, title, description, deadline, priority, taskStatus], function(err) {
            if (err) {
                console.error('Error adding task:', err.message);
                return res.status(500).json({ message: 'Server error adding task.' });
            }
            res.status(201).json({ message: 'Task added successfully!', taskId: this.lastID });
        });
});

app.put('/tasks/:id', authenticateToken, (req, res) => {
    const taskId = req.params.id;
    const { title, description, deadline, priority, status, category_id } = req.body;

    if (!title || !priority || !status) {
        return res.status(400).json({ message: 'Title, priority, and status are required fields.' });
    }

    db.run('UPDATE tasks SET title = ?, description = ?, deadline = ?, priority = ?, status = ?, category_id = ? WHERE id = ? AND user_id = ?',
        [title, description, deadline, priority, status, category_id || null, taskId, req.user.userId], function(err) {
            if (err) {
                console.error('Error updating task:', err.message);
                return res.status(500).json({ message: 'Server error updating task.' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Task not found or unauthorized to update.' });
            }
            res.json({ message: 'Task updated successfully!' });
        });
});

app.patch('/tasks/:id/status', authenticateToken, (req, res) => {
    const taskId = req.params.id;
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ message: 'Status is required to update.' });
    }
    db.run('UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?',
        [status, taskId, req.user.userId], function(err) {
            if (err) {
                console.error('Error updating task status:', err.message);
                return res.status(500).json({ message: 'Server error updating task status.' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Task not found or unauthorized to update status.' });
            }
            res.json({ message: 'Task status updated successfully!' });
        });
});

app.delete('/tasks/:id', authenticateToken, (req, res) => {
    const taskId = req.params.id;
    db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, req.user.userId], function(err) {
        if (err) {
            console.error('Error deleting task:', err.message);
            return res.status(500).json({ message: 'Server error deleting task.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Task not found or unauthorized to delete.' });
        }
        res.json({ message: 'Task deleted successfully!' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});