
// Create a new SousCritère
router.post('/:critereId/souscritere', async (req, res) => {
    try {
        const critere = await Critère.findById(req.params.critereId);
        if (!critere) {
            return res.status(404).json({ error: 'Critère not found' });
        }

        const sousCritere = new SousCritère(req.body);
        critere.SousCritères.push(sousCritere);
        await critere.save();
        res.status(201).json(sousCritere);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all SousCritères of a Critère
router.get('/:critereId/souscritere', async (req, res) => {
    try {
        const critere = await Critère.findById(req.params.critereId).populate('SousCritères');
        if (!critere) {
            return res.status(404).json({ error: 'Critère not found' });
        }
        res.json(critere.SousCritères);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get SousCritère by ID
router.get('/:critereId/souscritere/:id', async (req, res) => {
    try {
        const critere = await Critère.findById(req.params.critereId);
        if (!critere) {
            return res.status(404).json({ error: 'Critère not found' });
        }

        const sousCritere = critere.SousCritères.id(req.params.id);
        if (!sousCritere) {
            return res.status(404).json({ error: 'SousCritère not found' });
        }
        res.json(sousCritere);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a SousCritère
router.put('/:critereId/souscritere/:id', async (req, res) => {
    try {
        const critere = await Critère.findById(req.params.critereId);
        if (!critere) {
            return res.status(404).json({ error: 'Critère not found' });
        }

        const sousCritere = critere.SousCritères.id(req.params.id);
        if (!sousCritere) {
            return res.status(404).json({ error: 'SousCritère not found' });
        }

        // Update SousCritère
        Object.assign(sousCritere, req.body);
        await critere.save();
        res.json(sousCritere);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a SousCritère
router.delete('/:critereId/souscritere/:id', async (req, res) => {
    try {
        const critere = await Critère.findById(req.params.critereId);
        if (!critere) {
            return res.status(404).json({ error: 'Critère not found' });
        }

        const sousCritere = critere.SousCritères.id(req.params.id);
        if (!sousCritere) {
            return res.status(404).json({ error: 'SousCritère not found' });
        }

        sousCritere.remove();
        await critere.save();
        res.json({ message: 'SousCritère deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
