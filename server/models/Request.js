const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['approved', 'rejected']
  },
  by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remark: {
    type: String
  },
  at: {
    type: Date,
    default: Date.now
  }
});

const requestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  deadline: {
    type: Date
  },
  history: [historySchema]
}, { timestamps: true });

module.exports =
  mongoose.models.Request ||
  mongoose.model('Request', requestSchema);
