const express = require('express');
const mongoose = require('mongoose');

const express = require('express');

const router = express.Router();
const { Critere, SousCritere } = require('../models/critereModel');

// Create a new Critere
router.post('/', async (req, res) => {
    try {
        const critere = new Critere(req.body);
        await critere.save();
        res.status(201).json(critere);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all Criteres
router.get('/', async (req, res) => {
    try {
        const criteres = await Critere.find();
        res.json(criteres);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Critere by ID
router.get('/:id', async (req, res) => {
    try {
        const critere = await Critere.findById(req.params.id);
        if (!critere) {
            return res.status(404).json({ error: 'Critere not found' });
        }
        res.json(critere);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a Critere
router.put('/:id', async (req, res) => {
    try {
        const critere = await Critere.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!critere) {
            return res.status(404).json({ error: 'Critere not found' });
        }
        res.json(critere);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a Critere
router.delete('/:id', async (req, res) => {
    try {
        const critere = await Critere.findByIdAndDelete(req.params.id);
        if (!critere) {
            return res.status(404).json({ error: 'Critere not found' });
        }
        res.json({ message: 'Critere deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
