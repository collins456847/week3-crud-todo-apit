require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const Todo = require('./models/Todo');

const app = express();

app.use(express.json());

// Check that a Todo ID is valid
function validId(id) {
  return mongoose.isValidObjectId(id);
}

// CREATE: Add a Todo
app.post('/todos', async (req, res) => {
  try {
    const todo = await Todo.create({
      task: req.body.task,
      completed: req.body.completed
    });

    res.status(201).json(todo);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create Todo' });
  }
});

// READ: Get all Todos, with optional completed filter
app.get('/todos', async (req, res) => {
  try {
    const filter = {};

    if (req.query.completed !== undefined) {
      if (!['true', 'false'].includes(req.query.completed)) {
        return res.status(400).json({
          error: 'completed must be true or false'
        });
      }

      filter.completed = req.query.completed === 'true';
    }

    const todos = await Todo.find(filter).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Todos' });
  }
});

// READ: Get one Todo
app.get('/todos/:id', async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid Todo ID' });
    }

    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Todo' });
  }
});

// UPDATE: Edit a Todo
app.patch('/todos/:id', async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid Todo ID' });
    }

    const updates = {};

    if (req.body.task !== undefined) {
      updates.task = req.body.task;
    }

    if (req.body.completed !== undefined) {
      updates.completed = req.body.completed;
    }

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update Todo' });
  }
});

// DELETE: Remove a Todo
app.delete('/todos/:id', async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid Todo ID' });
    }

    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully', todo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete Todo' });
  }
});

// Connect to MongoDB before accepting requests
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });