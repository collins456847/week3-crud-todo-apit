const express = require('express');
const Joi = require('joi');

const app = express();

app.use(express.json());

// ========================================
// LOGGING MIDDLEWARE
// ========================================

app.use((req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;

        console.log(
            `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
        );
    });

    next();
});

// ========================================
// IN-MEMORY TODO DATA
// ========================================

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

// ========================================
// JOI VALIDATION SCHEMAS
// ========================================

// Validation for creating a todo
const createTodoSchema = Joi.object({
    task: Joi.string().trim().min(3).required(),
    completed: Joi.boolean().optional()
}).unknown(false);

// Validation for updating a todo
const updateTodoSchema = Joi.object({
    task: Joi.string().trim().min(3),
    completed: Joi.boolean()
})
    .min(1)
    .unknown(false);

// ========================================
// VALIDATION MIDDLEWARE
// ========================================

const validateCreateTodo = (req, res, next) => {
    const { error, value } = createTodoSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            error: 'Validation failed',
            message: error.details[0].message
        });
    }

    req.body = value;

    next();
};

const validateUpdateTodo = (req, res, next) => {
    const { error, value } = updateTodoSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            error: 'Validation failed',
            message: error.details[0].message
        });
    }

    req.body = value;

    next();
};

// ========================================
// GET ALL TODOS
// ========================================

app.get('/todos', (req, res, next) => {
    try {
        res.status(200).json(todos);
    } catch (err) {
        next(err);
    }
});

// ========================================
// GET ACTIVE TODOS
// ========================================

app.get('/todos/active', (req, res) => {
    const activeTodos = todos.filter(
        (todo) => !todo.completed
    );

    res.status(200).json(activeTodos);
});

// ========================================
// GET COMPLETED TODOS
// ========================================

app.get('/todos/completed', (req, res) => {
    const completedTodos = todos.filter(
        (todo) => todo.completed
    );

    res.status(200).json(completedTodos);
});

// ========================================
// GET ONE TODO
// ========================================

app.get('/todos/:id', (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: 'Invalid todo ID'
            });
        }

        const todo = todos.find(
            (todo) => todo.id === id
        );

        if (!todo) {
            return res.status(404).json({
                message: 'Todo not found'
            });
        }

        res.status(200).json(todo);
    } catch (err) {
        next(err);
    }
});

// ========================================
// CREATE A TODO
// ========================================

app.post(
    '/todos',
    validateCreateTodo,
    (req, res, next) => {
        try {
            const newTodo = {
                id: todos.length > 0
                    ? Math.max(...todos.map(todo => todo.id)) + 1
                    : 1,

                task: req.body.task,
                completed: req.body.completed ?? false
            };

            todos.push(newTodo);

            res.status(201).json(newTodo);
        } catch (err) {
            next(err);
        }
    }
);

// ========================================
// UPDATE A TODO
// ========================================

app.patch(
    '/todos/:id',
    validateUpdateTodo,
    (req, res, next) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id < 1) {
                return res.status(400).json({
                    error: 'Invalid todo ID'
                });
            }

            const todo = todos.find(
                (todo) => todo.id === id
            );

            if (!todo) {
                return res.status(404).json({
                    message: 'Todo not found'
                });
            }

            // Update only the allowed fields
            if (req.body.task !== undefined) {
                todo.task = req.body.task;
            }

            if (req.body.completed !== undefined) {
                todo.completed = req.body.completed;
            }

            res.status(200).json(todo);
        } catch (err) {
            next(err);
        }
    }
);

// ========================================
// DELETE A TODO
// ========================================

app.delete('/todos/:id', (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: 'Invalid todo ID'
            });
        }

        const initialLength = todos.length;

        todos = todos.filter(
            (todo) => todo.id !== id
        );

        if (todos.length === initialLength) {
            return res.status(404).json({
                error: 'Todo not found'
            });
        }

        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

// ========================================
// HANDLE UNKNOWN ROUTES
// ========================================

app.use((req, res, next) => {
    const err = new Error('Route not found');

    err.status = 404;

    next(err);
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
    console.error('Error:', err.message);

    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.status || 500;

    res.status(statusCode).json({
        error: statusCode === 404
            ? 'Not Found'
            : 'Internal Server Error',

        message: statusCode === 404
            ? err.message
            : 'Something went wrong'
    });
});

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 3002;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});