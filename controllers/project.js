const Project = require('../models/Project');
const user = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');

exports.getProject = async (req, res, next) => {
  try {
    await Project.findById(new mongoose.Types.ObjectId(req.params.projectID))
      .populate('admin', '_id username image')
      .populate('team.user_id', '_id username image')
      .populate('tasks.team', '_id username image')
      .exec()
      .then(docs => {
        res.status(200).json(docs)
      })
      .catch(err => {
        res.status(404).json({ error: err })
      })


  } catch (error) {
    res.status(500).json({ error: error })
  }
}


exports.createProject = async (req, res) => {
  try {
    const project = req.body
    const admin = await user.findById(project.admin)
    const newProject = new Project({
      admin: admin._id,
      name: project.name,
      description: project.description,
      vibe: project.vibe
    })
    newProject.save()
    res.status(201).json({ message: "Done!", id: newProject._id })

  } catch (error) {
    res.status(500).json({ error: error })
  }
}

exports.updateProject = async (req, res) => {
  try {
    const project = req.body
    await Project.findByIdAndUpdate(new mongoose.Types.ObjectId(project.id), project, { new: true })
      .populate('admin', '_id username image')
      .populate('team.user_id', '_id username image')
      .populate('tasks.team', '_id username image')
      .exec()
      .then(docs => {
        res.status(200).json(docs)
      })
      .catch(err => {
        res.status(404).json({ error: err })
      })
  } catch (error) {
    res.status(500).json({ error: error })
  }
}

exports.deleteProject = async (req, res) => {
  try {
    const project = req.body
    await Project.findByIdAndRemove(new mongoose.Types.ObjectId(project.id), { new: true })
      .exec()
      .then(docs => {
        res.status(200).json({ success: "Done" })
      })
      .catch(err => {
        console.log(err)
        res.status(404).json({ error: err })
      })


  } catch (error) {
    res.status(500).json({ error: error })
  }
}


exports.projectUpdate = async (req, res) => {
  try {
    const updates = req.body;
    const productId = updates._id
    const action = updates.action;
    const teamMember = updates.teamMember;


    if (action === 'add') {
      Project.findByIdAndUpdate(productId, { $push: { team: teamMember } }, { new: true })
        .then(updatedProduct => {
          // Handle the success case
          res.json(updatedProduct);
        })
        .catch(error => {
          // Handle the error case
          res.status(500).json({ error: 'Internal Server Error' });
        });
    } else if (action === 'remove') {
      Project.findByIdAndUpdate(productId, { $pull: { team: { user_id: teamMember.user_id } } }, { new: true })
        .then(updatedProduct => {
          // Handle the success case
          res.json(updatedProduct);
        })
        .catch(error => {
          // Handle the error case
          res.status(500).json({ error: 'Internal Server Error' });
        });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}

exports.myProjects = async (req, res) => {
  const { username } = req.params;

  try {
    const projects = await Project.aggregate([
      // {
      //   $match: {
      //     team: { $exists: true, $ne: [] }
      //   }
      // },
      {
        $lookup: {
          from: 'users',
          localField: 'admin',
          foreignField: '_id',
          as: 'main_admin'
        }
      },
      {
        $match: {
          'main_admin.username': username
        }
      },
      {
        $project: {
          admin: 1,
          team: 1,
          name: 1,
          description: 1,
          vibe: 1,
          deadline: 1,

        },
      }
    ]);

    res.json(projects);
  } catch (error) {
    console.error('Error retrieving projects', error);
    res.status(500).json({ message: 'Error retrieving projects' });
  }
}

exports.teamProjects = async (req, res) => {
  const { username } = req.params;

  try {
    const projects = await Project.aggregate([
      {
        $match: {
          team: { $exists: true, $ne: [] }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'team.user_id',
          foreignField: '_id',
          as: 'team'
        }
      },
      {
        $match: {
          'team.username': username
        }
      },
      {
        $project: {
          admin: 1,
          name: 1,
          description: 1,
          vibe: 1,
          deadline: 1,
          team: {
            _id: 1,
            username: 1,
            image: 1
          }
        },
      }
    ]);

    res.json(projects);
  } catch (error) {
    console.error('Error retrieving projects', error);
    res.status(500).json({ message: 'Error retrieving projects' });
  }
}




// Tasks

exports.addTask = async (req, res) => {
  try {
    const projectId = req.params.projectId
    const task = req.body
    task['creator'] = req.user.id
    await Project.findByIdAndUpdate(projectId, { $push: { tasks: task } }, { new: true })
      .then(updatedProduct => {
        // Handle the success case
        res.json(updatedProduct);
      })
      .catch(error => {
        // Handle the error case
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.removeTask = async (req, res) => {
  try {
    const projectId = req.params.projectId
    await Project.findByIdAndUpdate(projectId, { $pull: { tasks: { _id: req.params.taskId } } }, { new: true })
      .then(updatedProduct => {
        // Handle the success case
        res.json(updatedProduct);
      })
      .catch(error => {
        // Handle the error case
        res.status(500).json({ error: 'Internal Server Error' });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.changeTaskStatus = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { status, userId } = req.body;

    // Validate the status value
    const validStatuses = ['todo', 'inProgress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Find the project by ID and update the task's status
    const project = await Project.findOneAndUpdate(
      { _id: projectId, 'tasks._id': taskId },
      {
        $set: {
          'tasks.$.status': status,
          'tasks.$.lastUpdatedBy': new mongoose.Types.ObjectId(userId),
        },
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project or task not found' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.changeTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  const { task, deadline, team, status, color } = req.body;
  try {
    const product = await Project.findById(projectId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingTask = product.tasks.find(t => t._id.toString() === taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task) existingTask.task = task;
    if (deadline) existingTask.deadline = deadline;
    if (team) existingTask.team = team;
    if (status) existingTask.status = status;
    if (color) existingTask.color = color;

    await product.save();

    res.json({ message: 'Task updated successfully', task: existingTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserTasks = async (req, res) => {
  try {
    const status = req.query.status;


    // Find the project by ID and update the task's status
    const userId = req.user.id;

    const projects = await Project.aggregate([

      {
        $match: {
          'team.user_id': new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $unwind: '$tasks',
      },
      {
        $match: {
          'tasks.status': { $in: status },
          'tasks.team': new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $sort: {
          'tasks.deadline': -1,
        },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          description: { $first: '$description' },
          vibe: { $first: '$vibe' },
          tasks: { $push: '$tasks' },
        },
      },


    ]);
    // if (!projects) {
    //   return res.status(404).json({ error: 'Project or task not found' });
    // }
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Graph

exports.usersTask = async (req, res) => {
  const { projectId } = req.params;
  const status = req.query.status
  try {
    const project = await Project.findById(projectId).populate('team.user_id');
  
    if (!project) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const userCompTasksCount = project.team.map((teamMember) => {
      const completedTasks = project.tasks.filter(
        (task) =>
          task.lastUpdatedBy.equals(teamMember.user_id._id) && task.status === 'completed'
      );
      return {
        _id: teamMember.user_id._id,
        username: teamMember.user_id.username,
        noOfTasks: completedTasks.length,
      };
    });

    const userTodoTasksCount = project.team.map((teamMember) => {
      const completedTasks = project.tasks.filter(
        (task) =>
          task.lastUpdatedBy.equals(teamMember.user_id._id) && task.status === 'todo'
      );
      return {
        _id: teamMember.user_id._id,
        username: teamMember.user_id.username,
        noOfTasks: completedTasks.length,
      };
    });
    const userProgressTasksCount = project.team.map((teamMember) => {
      const completedTasks = project.tasks.filter(
        (task) =>
          task.lastUpdatedBy.equals(teamMember.user_id._id) && task.status === 'inProgress'
      );
      return {
        _id: teamMember.user_id._id,
        username: teamMember.user_id.username,
        noOfTasks: completedTasks.length,
      };
    });
    
    res.json({ userCompTasksCount: userCompTasksCount, 
      userTodoTasksCount: userTodoTasksCount,
      userProgressTasksCount: userProgressTasksCount,
       taskCount: project.tasks.length });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};