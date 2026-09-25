const express = require('express');

const app = express();

app.use(express.json()); // Parse JSON bodies

let todos = [
    { id: 1, task: 'Learn Node.js', completed: false },
    { id: 2, task: 'Build CRUD API', completed: false },
];

// GET All – Read
app.get('/todos', (req, res) => {
    res.status(200).json(todos);
});


// GET Single Todo – Read
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


// GET Active Todos – Bonus
app.get('/todos/active', (req, res) => {
    const activeTodos = todos.filter((t) => !t.completed);

    res.status(200).json(activeTodos);
});


// POST New – Create
app.post('/todos', (req, res) => {

    // Validation: task is required
    if (!req.body.task) {
        return res.status(400).json({
            error: 'Task field is required'
        });
    }

    const newTodo = {
        id: todos.length + 1,
        ...req.body
    };

    todos.push(newTodo);

    res.status(201).json(newTodo);
});


// PATCH Update – Partial
app.patch('/todos/:id', (req, res) => {

    const todo = todos.find(
        (t) => t.id === parseInt(req.params.id)
    );

    if (!todo) {
        return res.status(404).json({
            message: 'Todo not found'
        });
    }

    Object.assign(todo, req.body);

    res.status(200).json(todo);
});


// DELETE Remove
app.delete('/todos/:id', (req, res) => {

    const id = parseInt(req.params.id);

    const initialLength = todos.length;

    todos = todos.filter((t) => t.id !== id);

    if (todos.length === initialLength) {
        return res.status(404).json({
            error: 'Not found'
        });
    }

    res.status(204).send();
});


// GET Completed Todos
app.get('/todos/completed', (req, res) => {

    const completed = todos.filter((t) => t.completed);

    res.json(completed);
});


// Error Handler
app.use((err, req, res, next) => {
    res.status(500).json({
        error: 'Server error!'
    });
});


const PORT = 3002;

app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
});
