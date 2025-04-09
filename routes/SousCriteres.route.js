const { Critere, SousCritere } = require('../models.js');
const express = require('express');
const router = express.Router();

router.post('/:critereId/souscritere', async (req, res) => {
    try {
        const critere = await Critere.findById(req.params.critereId);
        if (!critere) {
            return res.status(404).json({ error: 'Critere not found' });
        }

        const sousCritere = new SousCritere(req.body);
        critere.SousCriteres.push(sousCritere);
        await critere.save();
        res.status(201).json(sousCritere);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/:critereId/souscritere', async (req, res) => {
    try {
        const critere = await Critere.findById(req.params.critereId).populate('SousCriteres');
        if (!critere) {
            return res.status(404).json({ error: 'Critere not found' });
        }
        res.json(critere.SousCriteres);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get SousCritere by ID
router.get('/:critereId/souscritere/:id', async (req, res) => {
    try {
        const critere = await Critere.findById(req.params.critereId);
        if (!critere) {
            return res.status(404).json({ error: 'Critere not found' });
        }

        const sousCritere = critere.SousCriteres.id(req.params.id);
        if (!sousCritere) {
            return res.status(404).json({ error: 'SousCritere not found' });
        }
        res.json(sousCritere);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a SousCritere
router.put('/:critereId/souscritere/:id', async (req, res) => {
    try {
        const critere = await Critere.findById(req.params.critereId);
        if (!critere) {
            return res.status(404).json({ error: 'Critere not found' });
        }

        const sousCritere = critere.SousCriteres.id(req.params.id);
        if (!sousCritere) {
            return res.status(404).json({ error: 'SousCritere not found' });
        }

        // Update SousCritere
        Object.assign(sousCritere, req.body);
        await critere.save();
        res.json(sousCritere);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a SousCritere
router.delete('/:critereId/souscritere/:id', async (req, res) => {
    try {
        const critere = await Critere.findById(req.params.critereId);
        if (!critere) {
            return res.status(404).json({ error: 'Critere not found' });
        }

        const sousCritere = critere.SousCriteres.id(req.params.id);
        if (!sousCritere) {
            return res.status(404).json({ error: 'SousCritere not found' });
        }

        sousCritere.remove();
        await critere.save();
        res.json({ message: 'SousCritere deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
