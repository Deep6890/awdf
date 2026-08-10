const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Enable CORS for frontend communication
app.use(cors());

// Middleware 1: Request Logging (Global)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware to parse JSON bodies
app.use(express.json());

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
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({ error: 'Task not found' });
    }
    next();
};

// --- ROUTES ---

// GET /tasks: Retrieve all tasks
app.get('/tasks', async (req, res, next) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
});

// GET /tasks/stats: Retrieve task statistics
app.get('/tasks/stats', async (req, res, next) => {
    try {
        const total = await Task.countDocuments();
        const completed = await Task.countDocuments({ completed: true });
        const pending = total - completed;
        res.status(200).json({ total, completed, pending });
    } catch (err) {
        next(err);
    }
});

// GET /tasks/:id: Retrieve a single task by ID
app.get('/tasks/:id', validateTaskId, async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(task);
    } catch (err) {
        next(err);
    }
});

// POST /tasks: Create a new task
app.post('/tasks', async (req, res, next) => {
    try {
        const newTask = await Task.create(req.body);
        res.status(201).json(newTask);
    } catch (err) {
        next(err);
    }
});

// PUT /tasks/:id: Update an existing task
app.put('/tasks/:id', validateTaskId, async (req, res, next) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { 
            new: true, // return updated document
            runValidators: true // ensure validation rules run on update
        });
        
        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(updatedTask);
    } catch (err) {
        next(err);
    }
});

// DELETE /tasks/:id: Delete a task
app.delete('/tasks/:id', validateTaskId, async (req, res, next) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        next(err);
    }
});

// Middleware 3: 404 Handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Middleware 4: Global Error Handler (Must be last)
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${new Date().toISOString()}:`, err.stack);
    
    // Check if error is a Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ 
            error: 'Validation Error',
            messages: messages
        });
    }

    // Do not leak raw stack traces to the client
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server Running at http://localhost:${PORT}`);
});