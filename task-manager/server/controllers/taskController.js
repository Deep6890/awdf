const Task = require('../models/Task');
const cache = require('../cache/cache');
const taskEvents = require('../events/events');

// GET /tasks: Retrieve all tasks (cached under 'all_tasks')
const getTasks = async (req, res, next) => {
  try {
    const cachedTasks = cache.get('all_tasks');
    if (cachedTasks !== undefined) {
      return res.status(200).json(cachedTasks);
    }

    const tasks = await Task.find().sort({ createdAt: -1 }).lean();
    cache.set('all_tasks', tasks);
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

// GET /tasks/stats: Retrieve statistics
const getStats = async (req, res, next) => {
  try {
    const total = await Task.countDocuments();
    const completed = await Task.countDocuments({ completed: true });
    const pending = total - completed;
    res.status(200).json({ total, completed, pending });
  } catch (err) {
    next(err);
  }
};

// GET /tasks/:id: Retrieve single task (cached under 'task_<id>')
const getTaskById = async (req, res, next) => {
  try {
    const cacheKey = `task_${req.params.id}`;
    const cachedTask = cache.get(cacheKey);
    if (cachedTask !== undefined) {
      return res.status(200).json(cachedTask);
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    cache.set(cacheKey, task);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

// POST /tasks: Create new task (invalidates 'all_tasks')
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, completed } = req.body || {};
    if (!title || !title.trim()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: ['Title is required']
      });
    }
    const taskData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      completed: Boolean(completed)
    };
    if (req.user && req.user.id) {
      taskData.createdBy = req.user.id;
    }
    const newTask = await Task.create(taskData);

    // Invalidate cached task list
    cache.del('all_tasks');

    console.log(`[API] Response sent at ${new Date().toISOString()}`);
    res.status(201).json(newTask);

    // Asynchronously emit task-created event (P10)
    taskEvents.emit('task-created', newTask, req.user);
  } catch (err) {
    next(err);
  }
};

// PUT /tasks/:id: Update task (invalidates 'all_tasks' and 'task_<id>')
const updateTask = async (req, res, next) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Invalidate cached task list and specific item cache
    cache.del(['all_tasks', `task_${req.params.id}`]);

    res.status(200).json(updatedTask);
  } catch (err) {
    next(err);
  }
};

// DELETE /tasks/:id: Delete task (invalidates 'all_tasks' and 'task_<id>')
const deleteTask = async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Invalidate cached task list and specific item cache
    cache.del(['all_tasks', `task_${req.params.id}`]);

    console.log(`[API] Response sent at ${new Date().toISOString()}`);
    res.status(200).json({ message: 'Task deleted successfully' });

    // Asynchronously emit task-deleted event (P10 Supplementary)
    taskEvents.emit('task-deleted', deletedTask, req.user);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  getStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
