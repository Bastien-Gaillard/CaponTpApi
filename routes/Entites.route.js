const express = require('express');
const mongoose = require('mongoose');

const entitesRouter = express.Router();
const { Entite } = require('../models.js');

entitesRouter.post('/', async (req, res) => {
    try {
        const entite = new Entite(req.body);
        await entite.save();
        res.status(201).json(entite);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

entitesRouter.get('/', async (req, res) => {
    try {
        const entites = await Entite.find();
        res.json(entites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = entitesRouter;