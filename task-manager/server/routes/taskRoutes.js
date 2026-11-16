const express = require('express');
const router = express.Router();

const {
  getTasks,
  getStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');

// Protect all task routes
router.use(auth);

router.get('/', getTasks);
router.get('/stats', getStats);
router.get('/:id', validateObjectId, getTaskById);

router.post(
  '/',
  validate({
    title: { required: true, max: 100 },
    priority: { enum: ['low', 'medium', 'high'] }
  }),
  createTask
);

router.put(
  '/:id',
  validateObjectId,
  validate({
    title: { max: 100 },
    priority: { enum: ['low', 'medium', 'high'] }
  }),
  updateTask
);

router.delete('/:id', validateObjectId, deleteTask);

module.exports = router;
