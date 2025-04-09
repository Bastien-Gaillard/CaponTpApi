// evaluationRouter.js
const express = require('express');
const evaluationRouter = express.Router();
const { Evaluation, Entite, Groupe } = require('../models.js'); // Assurez-vous que le chemin est correct

// Créer une évaluation avec critères et sous-critères en une seule requête
evaluationRouter.post('/', async (req, res) => {
    console.log("[API DEBUG] POST /evaluations - Corps de la requête :", req.body);
    try {
        const { Nom, Date, Template } = req.body;
      
        const evaluation = new Evaluation({
            Nom,
            Date,
            Template, 
        });

        await evaluation.save();
        console.log("[API DEBUG] Évaluation créée :", evaluation);
        res.status(201).json(evaluation);
    } catch (error) {
        console.error("[API DEBUG] Erreur lors de la création de l'évaluation :", error);
        res.status(400).json({ error: error.message });
    }
});

// Mise à jour globale d'une évaluation (template) via PUT
evaluationRouter.put('/:id', async (req, res) => {
    console.log(`[API DEBUG] PUT /evaluations/${req.params.id} - Corps de la requête :`, req.body);
    try {
        const updatedEvaluation = await Evaluation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedEvaluation) {
            console.error("[API DEBUG] Évaluation non trouvée pour mise à jour :", req.params.id);
            return res.status(404).json({ error: 'Évaluation non trouvée' });
        }
        console.log("[API DEBUG] Évaluation mise à jour :", updatedEvaluation);
        res.json(updatedEvaluation);
    } catch (error) {
        console.error("[API DEBUG] Erreur lors de la mise à jour de l'évaluation :", error);
        res.status(400).json({ error: error.message });
    }
});

// Ajouter des entités à une évaluation
evaluationRouter.post('/:id/entites', async (req, res) => {
    console.log(`[API DEBUG] POST /evaluations/${req.params.id}/entites - Corps de la requête :`, req.body);
    try {
        const { entiteIds } = req.body;
        const evaluationId = req.params.id;

        const evaluation = await Evaluation.findById(evaluationId);
        if (!evaluation) {
            console.error("[API DEBUG] Évaluation non trouvée :", evaluationId);
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
        console.log("[API DEBUG] Entités ajoutées à l'évaluation :", evaluation);
        res.json(evaluation);
    } catch (error) {
        console.error("[API DEBUG] Erreur lors de l'ajout d'entités :", error);
        res.status(400).json({ error: error.message });
    }
});

// Mettre à jour les notes d'une entité dans une évaluation
evaluationRouter.post('/:id/notes', async (req, res) => {
    try {
        const { entiteId, criteria } = req.body;
        const evaluationId = req.params.id;
        const evaluation = await Evaluation.findById(evaluationId);
        if (!evaluation) {
            console.error("[API DEBUG] Évaluation non trouvée :", evaluationId);
            return res.status(404).json({ error: "Évaluation non trouvée" });
        }
        const entite = await Entite.findById(entiteId);
        if (!entite) {
            console.error("[API DEBUG] Entité non trouvée :", entiteId);
            return res.status(404).json({ error: "Entité non trouvée" });
        }
        let totalNote = 0;
        criteria.forEach(c => {
            const noteVal = typeof c.note === "number" ? c.note : 0;
            totalNote += noteVal;
        });
        const existingNote = evaluation.notes.find(n => n.entite?.IdMoodle === entite.IdMoodle);

        if (existingNote) {
            existingNote.criteria = criteria;
            existingNote.totalNote = totalNote;
        } else {
            evaluation.notes.push({
                entite: {
                    Nom1: entite.Nom1,
                    Nom2: entite.Nom2,
                    IdMoodle: entite.IdMoodle
                },
                criteria,
                totalNote
            });
        }
        await evaluation.save();
        console.log("[API DEBUG] Notes mises à jour pour l'entité", entite.IdMoodle);
        res.json(evaluation);
    } catch (error) {
        console.error("[API DEBUG] Erreur lors de la mise à jour des notes :", error);
        res.status(400).json({ error: error.message });
    }
});


evaluationRouter.post('/:id/groupes/:groupeId', async (req, res) => {
    try {
        const evaluationId = req.params.id;
        const groupeId = req.params.groupeId;

        // Récupération de l’évaluation
        const evaluation = await Evaluation.findById(evaluationId);
        if (!evaluation) {
            console.error("[API DEBUG] Évaluation non trouvée :", evaluationId);
            return res.status(404).json({ error: "Évaluation non trouvée" });
        }

        // Récupération du groupe avec les entités
        const groupe = await Groupe.findById(groupeId).populate('Entites');
        if (!groupe) {
            console.error("[API DEBUG] Groupe non trouvé :", groupeId);
            return res.status(404).json({ error: "Groupe non trouvé" });
        }

        evaluation.notes = evaluation.notes || [];

        const existingIdMoodles = evaluation.notes.map(n => n.entite?.IdMoodle);

        // Ajouter les entités du groupe qui ne sont pas déjà présentes dans les notes
        const newEntites = groupe.Entites.filter(entite =>
            !existingIdMoodles.includes(entite.IdMoodle)
        );

        newEntites.forEach(entite => {
            evaluation.notes.push({
                entite: {
                    Nom1: entite.Nom1,
                    Nom2: entite.Nom2,
                    IdMoodle: entite.IdMoodle
                },
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
        });

        await evaluation.save();

        console.log("[API DEBUG] Entités du groupe ajoutées à l'évaluation :", newEntites.length);
        res.json(evaluation);
    } catch (error) {
        console.error("[API DEBUG] Erreur lors de l'ajout des entités du groupe :", error);
        res.status(400).json({ error: error.message });
    }
});




// Récupérer toutes les évaluations
evaluationRouter.get('/', async (req, res) => {
    console.log("[API DEBUG] GET /evaluations - Requête reçue");
    try {
        const evaluations = await Evaluation.find().populate({ path: 'Entites', strictPopulate: false });
        console.log("[API DEBUG] Évaluations récupérées :", evaluations);
        res.json(evaluations);
    } catch (error) {
        console.error("[API DEBUG] Erreur lors de la récupération des évaluations :", error);
        res.status(500).json({ error: error.message });
    }
});

// Récupérer une évaluation par son id
evaluationRouter.get('/:id', async (req, res) => {
    console.log(`[API DEBUG] GET /evaluations/${req.params.id} - Requête reçue`);
    try {
        const evaluation = await Evaluation.findById(req.params.id)
            .populate({ path: 'Entites', strictPopulate: false });
        if (!evaluation) {
            console.error("[API DEBUG] Évaluation non trouvée :", req.params.id);
            return res.status(404).json({ error: 'Évaluation non trouvée' });
        }
        console.log("[API DEBUG] Évaluation récupérée :", evaluation);
        res.json(evaluation);
    } catch (error) {
        console.error("[API DEBUG] Erreur lors de la récupération de l'évaluation :", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = evaluationRouter;
