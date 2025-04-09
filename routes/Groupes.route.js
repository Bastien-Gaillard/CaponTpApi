const express = require('express');
const mongoose = require('mongoose');

const groupesRouter = express.Router();
const { Groupe, Entite } = require('../models.js'); 

groupesRouter.post('/', async (req, res) => {
    try {
        const groupe = new Groupe(req.body);
        await groupe.save();
        res.status(201).json(groupe);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

groupesRouter.get('/', async (req, res) => {
    try {
        const groupes = await Groupe.find().populate({path: 'Entites', strictPopulate: false});
        res.json(groupes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = groupesRouter;