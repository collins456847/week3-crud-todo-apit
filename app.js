const express = require('express');

const app = express();

app.use(express.json());

let todos = [
    {
        id: 1,
        task: 'Learn Node.js',
        completed: false
    },
    {
        id: 2,
        task: 'Build CRUD API',
        completed: false
    }
];

// GET ALL TODOS
app.get('/todos', (req, res) => {
    res.status(200).json(todos);
});

// GET ONE TODO
app.get('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const todo = todos.find((t) => t.id === id);

    if (!todo) {
        return res.status(404).json({
            message: 'Todo not found'
        });
    }

    res.status(200).json(todo);
});

// GET ACTIVE TODOS
app.get('/todos/active', (req, res) => {
    const activeTodos = todos.filter((t) => !t.completed);

    res.status(200).json(activeTodos);
});

// CREATE A TODO
app.post('/todos', (req, res) => {

    if (!req.body.task) {
        return res.status(400).json({
            error: 'Task field is required'
        });
    }

    const newTodo = {
        id: todos.length + 1,
        task: req.body.task,
        completed: req.body.completed || false
    };

    todos.push(newTodo);

    res.status(201).json(newTodo);
});

// UPDATE A TODO
app.patch('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const todo = todos.find((t) => t.id === id);

    if (!todo) {
        return res.status(404).json({
            message: 'Todo not found'
        });
    }

    Object.assign(todo, req.body);

    res.status(200).json(todo);
});

// DELETE A TODO
app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const initialLength = todos.length;

    todos = todos.filter((t) => t.id !== id);

    if (todos.length === initialLength) {
        return res.status(404).json({
            error: 'Todo not found'
        });
    }

    res.status(204).send();
});

// GET COMPLETED TODOS
app.get('/todos/completed', (req, res) => {
    const completedTodos = todos.filter((t) => t.completed);

    res.status(200).json(completedTodos);
});

// ERROR HANDLER
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        error: 'Server error!'
    });
});

// PORT
const PORT = process.env.PORT || 3002;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});