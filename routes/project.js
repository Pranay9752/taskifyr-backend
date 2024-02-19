

const express = require('express');
const router = express.Router();
const { getProject, createProject, updateProject, projectUpdate, deleteProject, myProjects, teamProjects, addTask, removeTask, changeTaskStatus, changeTask, getUserTasks,
    usersTask } = require('../controllers/project');
const auth = require('../middleware/authorize');
const checkUserRole = require('../middleware/check-permission');

router.get('/:projectID', auth, getProject);
router.post('/create', auth, createProject);
router.patch('/update', auth, updateProject);
router.patch('/team/update', auth, projectUpdate);
router.delete('/delete', auth, deleteProject);
router.get('/p/:username', auth, myProjects);
router.get('/teamprojects/:username', auth, teamProjects);

// task
router.get('/', auth, getUserTasks);
router.put('/task/add/:projectId', auth, addTask);
router.put('/:projectId/task/remove/:taskId', auth, removeTask);
router.patch('/:projectId/task/:taskId/status', auth, changeTaskStatus);
router.patch('/:projectId/task/:taskId', auth, changeTask);

// Graph
router.get('/users-task/:projectId', auth, usersTask);


module.exports = router;