const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS for frontend communication
app.use(cors());

// Middleware 1: Request Logging (Global)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory data store for tasks
let tasks = [
    { id: 1, title: 'Learn Node.js', description: 'Study Express and middleware', completed: true },
    { id: 2, title: 'Build REST API', description: 'Implement CRUD operations', completed: false }
];
let currentId = 3;

// Middleware 2: Reject POST/PUT without Content-Type: application/json
app.use((req, res, next) => {
    if (['POST', 'PUT'].includes(req.method)) {
        if (req.headers['content-type'] !== 'application/json') {
            return res.status(400).json({ error: 'Content-Type must be application/json' });
        }
    }
    next();
});

// Route-specific Middleware: Validate Task ID
const validateTaskId = (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid task ID format. Must be an integer.' });
    }
    req.taskId = id; // pass parsed ID to the route handler
    next();
};

// --- ROUTES ---

// GET /tasks: Retrieve all tasks
app.get('/tasks', (req, res) => {
    res.status(200).json(tasks);
});

// GET /tasks/stats: Retrieve task statistics (Unique Functionality)
app.get('/tasks/stats', (req, res) => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    res.status(200).json({ total, completed, pending });
});

// GET /tasks/:id: Retrieve a single task by ID
app.get('/tasks/:id', validateTaskId, (req, res) => {
    const task = tasks.find(t => t.id === req.taskId);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
});

// POST /tasks: Create a new task
app.post('/tasks', (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    
    const newTask = {
        id: currentId++,
        title,
        description: description || '',
        completed: false
    };
    
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// PUT /tasks/:id: Update an existing task
app.put('/tasks/:id', validateTaskId, (req, res) => {
    const { title, description, completed } = req.body;
    
    const taskIndex = tasks.findIndex(t => t.id === req.taskId);
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    const updatedTask = {
        ...tasks[taskIndex],
        title: title !== undefined ? title : tasks[taskIndex].title,
        description: description !== undefined ? description : tasks[taskIndex].description,
        completed: completed !== undefined ? completed : tasks[taskIndex].completed
    };
    
    tasks[taskIndex] = updatedTask;
    res.status(200).json(updatedTask);
});

// DELETE /tasks/:id: Delete a task
app.delete('/tasks/:id', validateTaskId, (req, res) => {
    const taskIndex = tasks.findIndex(t => t.id === req.taskId);
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    tasks.splice(taskIndex, 1);
    res.status(200).json({ message: 'Task deleted successfully' });
});

// Middleware 3: 404 Handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Middleware 4: Global Error Handler (Must be last)
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${new Date().toISOString()}:`, err.stack);
    // Do not leak raw stack traces to the client
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server Running at http://localhost:${PORT}`);
 });