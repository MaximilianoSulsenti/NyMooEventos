const express = require('express');
const {
  listTasks,
  listTasksForClient,
  createTask,
  createTaskForClient,
  updateTask,
  updateTaskForClient,
  deleteTask,
  deleteTaskForClient,
} = require('../controllers/taskController');
const { requireAuth } = require('../middleware/auth');
const { requireEventOwnership } = require('../middleware/eventOwnership');
const { requireClientToken } = require('../middleware/clientAccess');

const router = express.Router();

router.get('/event/:eventId', requireAuth, requireEventOwnership, listTasks);
router.post('/event/:eventId', requireAuth, requireEventOwnership, createTask);
router.patch('/event/:eventId/:taskId', requireAuth, requireEventOwnership, updateTask);
router.delete('/event/:eventId/:taskId', requireAuth, requireEventOwnership, deleteTask);

router.get('/client/:eventSlug', requireClientToken, listTasksForClient);
router.post('/client/:eventSlug', requireClientToken, createTaskForClient);
router.patch('/client/:eventSlug/:taskId', requireClientToken, updateTaskForClient);
router.delete('/client/:eventSlug/:taskId', requireClientToken, deleteTaskForClient);

module.exports = router;
