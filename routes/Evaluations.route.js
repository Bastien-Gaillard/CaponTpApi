// evaluationRouter.js
const express = require('express');
const evaluationRouter = express.Router();
const { Evaluation, Entite, Groupe } = require('../models.js');

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
        const evaluation = await Evaluation.findById(req.params.id);
        if (!evaluation) {
            console.error("[API DEBUG] Évaluation non trouvée pour mise à jour :", req.params.id);
            return res.status(404).json({ error: 'Évaluation non trouvée' });
        }
        
        // Mise à jour des champs de base
        evaluation.Nom = req.body.Nom;
        evaluation.Template = req.body.Template;
        
        // Reconstruction complète des notes pour chaque utilisateur
        const newCriteres = evaluation.Template.Criteres;
        evaluation.notes = evaluation.notes.map(note => {
            return {
                ...note,
                criteria: newCriteres.map(newCrit => {
                    const existingCrit = note.criteria.find(c => c.key === newCrit.key);
                    return {
                        key: newCrit.key,
                        label: newCrit.label,
                        percentage: newCrit.percentage,
                        note: existingCrit ? existingCrit.note : null,
                        desactive: newCrit.desactive, // Ajout de la propriété desactive ici
                        sub_criteria: newCrit.sub_criteria
                            ? newCrit.sub_criteria.map(newSub => {
                                const existingSub = existingCrit && existingCrit.sub_criteria
                                    ? existingCrit.sub_criteria.find(sc => sc.key === newSub.key)
                                    : null;
                                return {
                                    key: newSub.key,
                                    label: newSub.label,
                                    note: existingSub ? existingSub.note : null,
                                    ordre: newSub.ordre,
                                    desactive: newSub.desactive,
                                };
                            })
                            : []
                    };
                })
            };
        });
        

        const updatedEvaluation = await evaluation.save();
        console.log("[API DEBUG] Évaluation mise à jour avec template et notes reconstruites :", updatedEvaluation);
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
        // Fusionner les entités déjà présentes avec celles à ajouter
        const uniqueEntites = [...new Set([...evaluation.Entite, ...entiteIds])];
        evaluation.Entite = uniqueEntites;
        entiteIds.forEach(entiteId => {
            if (!evaluation.notes.some(n => n.entite.IdMoodle === entiteId)) {
                evaluation.notes.push({
                    entite: {
                        Nom1: "Inconnu",
                        Nom2: "Entité",
                        IdMoodle: entiteId
                    },
                    criteria: evaluation.Template.Criteres.map(c => ({
                        key: c.key,
                        label: c.label,
                        percentage: c.percentage,
                        note: null,
                        sub_criteria: c.sub_criteria?.map(sc => ({
                            key: sc.key,
                            label: sc.label,
                            note: null,
                            ordre: sc.ordre,
                            desactive: sc.desactive
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
        // Recherche de l'entité via son identifiant Moodle dans la collection Entite
        const entite = await Entite.findOne({ idMoodle: entiteId });
        if (!entite) {
            console.error("[API DEBUG] Entité non trouvée :", entiteId);
            return res.status(404).json({ error: "Entité non trouvée" });
        }
        let totalNote = 0;
        criteria.forEach(c => {
            const noteVal = typeof c.note === "number" ? c.note : 0;
            totalNote += noteVal;
        });
        const existingNote = evaluation.notes.find(n => n.entite.IdMoodle === entiteId);
        if (existingNote) {
            existingNote.criteria = criteria;
            existingNote.totalNote = totalNote;
        } else {
            evaluation.notes.push({
                entite: {
                    Nom1: entite.nom1,
                    Nom2: entite.nom2,
                    IdMoodle: entite.idMoodle
                },
                criteria,
                totalNote
            });
        }
        await evaluation.save();
        console.log("[API DEBUG] Notes mises à jour pour l'entité", entiteId);
        res.json(evaluation);
    } catch (error) {
        console.error("[API DEBUG] Erreur lors de la mise à jour des notes :", error);
        res.status(400).json({ error: error.message });
    }
});

// Ajouter les entités d'un groupe à une évaluation
evaluationRouter.post('/:id/groupes/:groupeId', async (req, res) => {
    try {
        const evaluationId = req.params.id;
        const groupeId = req.params.groupeId;
        const evaluation = await Evaluation.findById(evaluationId);
        if (!evaluation) {
            console.error("[API DEBUG] Évaluation non trouvée :", evaluationId);
            return res.status(404).json({ error: "Évaluation non trouvée" });
        }
        const groupe = await Groupe.findById(groupeId)
            .populate({ path: 'entites', strictPopulate: false });
        if (!groupe) {
            console.error("[API DEBUG] Groupe non trouvé :", groupeId);
            return res.status(404).json({ error: "Groupe non trouvé" });
        }
        evaluation.notes = evaluation.notes || [];
        const existingIdMoodles = evaluation.notes.map(n => n.entite?.IdMoodle);
        const newEntites = (groupe.entites || []).filter(entite =>
            !existingIdMoodles.includes(entite.idMoodle)
        );
        newEntites.forEach(entite => {
            evaluation.notes.push({
                entite: {
                    Nom1: entite.nom1,
                    Nom2: entite.nom2,
                    IdMoodle: entite.idMoodle
                },
                criteria: evaluation.Template.Criteres.map(c => ({
                    key: c.key,
                    label: c.label,
                    percentage: c.percentage,
                    note: null,
                    sub_criteria: c.sub_criteria?.map(sc => ({
                        key: sc.key,
                        label: sc.label,
                        note: null,
                        ordre: sc.ordre,
                        desactive: sc.desactive
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
