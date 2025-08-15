const mongoose = require('mongoose');

// Task Schema
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in_progress', 'completed', 'cancelled'],
      message: 'Status must be pending, in_progress, completed, or cancelled'
    },
    default: 'pending'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority must be low, medium, high, or urgent'
    },
    default: 'medium'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(date) {
        // Due date should be in the future for new tasks
        return !this.isNew || date > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  comments: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedAt: {
    type: Date,
    default: null
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    max: [1000, 'Estimated hours seems too high']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    max: [1000, 'Actual hours seems too high']
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
taskSchema.index({ status: 1, priority: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ createdAt: -1 });

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

// Pre-save middleware
taskSchema.pre('save', function(next) {
  // Update completedAt when status changes to completed
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = null;
    }
  }
  next();
});

// Populate user references by default
taskSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'assignedTo',
    select: 'name email avatar'
  }).populate({
    path: 'createdBy',
    select: 'name email avatar'
  }).populate({
    path: 'comments.author',
    select: 'name email avatar'
  });
  next();
});

// Instance method to add comment
taskSchema.methods.addComment = async function(text, userId) {
  this.comments.push({
    text,
    author: userId
  });
  return this.save();
};

// Instance method to check if user can modify task
taskSchema.methods.canModify = function(userId, userRole) {
  return (
    userRole === 'admin' || 
    this.createdBy._id.toString() === userId.toString() ||
    (this.assignedTo && this.assignedTo._id.toString() === userId.toString())
  );
};

// Transform output
taskSchema.methods.toJSON = function() {
  const task = this.toObject({ virtuals: true });
  delete task.__v;
  return task;
};

// Static method for advanced search
taskSchema.statics.searchTasks = async function(filters, options) {
  const {
    search,
    status,
    priority,
    assignedTo,
    createdBy,
    tags,
    dueDateFrom,
    dueDateTo,
    isOverdue
  } = filters;

  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  // Build query
  const query = {};

  // Text search
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Status filter
  if (status) {
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else {
      query.status = status;
    }
  }

  // Priority filter
  if (priority) {
    if (Array.isArray(priority)) {
      query.priority = { $in: priority };
    } else {
      query.priority = priority;
    }
  }

  // User filters
  if (assignedTo) query.assignedTo = assignedTo;
  if (createdBy) query.createdBy = createdBy;

  // Tags filter
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  // Date range filter
  if (dueDateFrom || dueDateTo) {
    query.dueDate = {};
    if (dueDateFrom) query.dueDate.$gte = new Date(dueDateFrom);
    if (dueDateTo) query.dueDate.$lte = new Date(dueDateTo);
  }

  // Overdue filter
  if (isOverdue === 'true') {
    query.dueDate = { $lt: new Date() };
    query.status = { $ne: 'completed' };
  }

  // Don't show archived tasks unless specifically requested
  if (!filters.includeArchived) {
    query.isArchived = false;
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [tasks, total] = await Promise.all([
    this.find(query).sort(sort).skip(skip).limit(limit),
    this.countDocuments(query)
  ]);

  return {
    tasks,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;