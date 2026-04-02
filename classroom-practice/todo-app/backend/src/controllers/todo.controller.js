const Todo = require("../models/todo.model");

const createTodo = async (req, res) => {
    try {
        const todo = await Todo.create(req.body);
        res.status(201).json(todo);   
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTodo = async (req, res) => {
    try {
        const todo = await Todo.find();
        res.status(200).json(todo);   
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateTodo = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedTodo = await Todo.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.status(200).json(updatedTodo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTodo = await Todo.findByIdAndDelete(id);

        if (!deletedTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.status(200).json({
            message: "Todo deleted successfully",
            deletedTodo
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTodo, getTodo, updateTodo , deleteTodo };