// models/User.js
const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date },
  vibe: { type: String, required: true },
  team: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Use 'user_id' instead of 'username'
      role: {
        type: String,
        enum: ['projectManager', 'teamMember', 'viewer'],
        default: 'teamMember',
        index: true
      }
    }
  ],
  tasks: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true,
        auto: true,
      },
      creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      task: { type: String, required: true },
      status: {
        type: String,
        enum: ['todo', 'inProgress', 'completed'],
        default: 'todo',
        index: true
      },
      deadline: { type: Date, required: true },
      color: { type: String },
      team: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      ],
    }
  ]
});

module.exports = mongoose.model('Product', ProjectSchema);
