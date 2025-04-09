const express = require('express');
const evaluationRouter = express.Router();
const { Evaluation, Entite } = require('../models.js'); // Assurez-vous que le chemin est correct

// ✅ Créer une évaluation avec critères et sous-critères en une seule requête
evaluationRouter.post('/', async (req, res) => {
    try {
        const { Nom, Date, Template } = req.body;
      
        const evaluation = new Evaluation({
            Nom,
            Date,
            Template, 
        });

        await evaluation.save();
        res.status(201).json(evaluation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

evaluationRouter.post('/:id/entites', async (req, res) => {
    try {
        const { entiteIds } = req.body;
        const evaluationId = req.params.id;

        const evaluation = await Evaluation.findById(evaluationId);
        if (!evaluation) {
            return res.status(404).json({ error: "Évaluation non trouvée" });
        }

        const uniqueEntites = [...new Set([...evaluation.Entite, ...entiteIds])];
        evaluation.Entite = uniqueEntites;

        entiteIds.forEach(entiteId => {
            if (!evaluation.notes.some(n => n.entite.toString() === entiteId)) {
                evaluation.notes.push({
                    entite: entiteId,
                    criteria: evaluation.Template.Criteres.map(c => ({
                        key: c.key,
                        label: c.label,
                        percentage: c.percentage,
                        note: null,
                        sub_criteria: c.sub_criteria?.map(sc => ({
                            key: sc.key,
                            label: sc.label,
                            note: null 
                        })) || []
                    })),
                    totalNote: null
                });
            }
        });
        await evaluation.save();
        res.json(evaluation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


evaluationRouter.post('/:id/notes', async (req, res) => {
    console.log('Request body:', req.body);
    console.log('Evaluation ID:', req.params.id);
    try {
        const { entiteId, criteria } = req.body;
        const evaluationId = req.params.id;

        const evaluation = await Evaluation.findById(evaluationId);
        if (!evaluation) {
            return res.status(404).json({ error: "Évaluation non trouvée" });
        }

        let totalNote = 0;
        criteria.forEach(c => {
            if (c.note !== null) totalNote += c.note;
        });

        const existingNote = evaluation.notes.find(n => n.entite.toString() === entiteId);
        if (existingNote) {
            existingNote.criteria = criteria;
            existingNote.totalNote = totalNote;
        } else {
            evaluation.notes.push({ entite: entiteId, criteria, totalNote });
        }

        await evaluation.save();
        res.json(evaluation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ✅ Récupérer toutes les évaluations
evaluationRouter.get('/', async (req, res) => {
    try {
        const evaluations = await Evaluation.find().populate({path: 'Entites', strictPopulate: false});
        res.json(evaluations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = evaluationRouter;
