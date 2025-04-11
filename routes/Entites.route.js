// routes/entites.js
const express = require("express");
const { Entite } = require("../models");
const entitesRouter = express.Router();

// Création d'une entité
entitesRouter.post("/", async (req, res) => {
  try {
    const { Nom1, Nom2, IdMoodle, nom1, nom2, idMoodle } = req.body;
    if (!(nom1 || Nom1) || !(nom2 || Nom2) || !(idMoodle || IdMoodle)) {
      return res
        .status(400)
        .json({ error: "Tous les champs (Nom1, Nom2, IdMoodle) sont requis." });
    }
    const entiteData = {
      nom1: nom1 || Nom1,
      nom2: nom2 || Nom2,
      idMoodle: idMoodle || IdMoodle,
    };
    const entite = new Entite(entiteData);
    await entite.save();
    res.status(201).json(entite);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Récupération de toutes les entités
entitesRouter.get("/", async (req, res) => {
  try {
    const entites = await Entite.find();
    res.json(entites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mise à jour d'une entité
entitesRouter.put("/:entityId", async (req, res) => {
  try {
    const { entityId } = req.params;
    const { Nom1, Nom2, IdMoodle, nom1, nom2, idMoodle } = req.body;
    const updatedData = {
      nom1: nom1 || Nom1,
      nom2: nom2 || Nom2,
      idMoodle: idMoodle || IdMoodle,
    };
    const updatedEntity = await Entite.findByIdAndUpdate(entityId, updatedData, { new: true });
    if (!updatedEntity) {
      return res.status(404).json({ error: "Entité non trouvée" });
    }
    res.json(updatedEntity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Suppression d'une entité
entitesRouter.delete("/:entityId", async (req, res) => {
  try {
    const { entityId } = req.params;
    const deletedEntity = await Entite.findByIdAndDelete(entityId);
    if (!deletedEntity) {
      return res.status(404).json({ error: "Entité non trouvée" });
    }
    res.json({ message: "Entité supprimée avec succès" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = entitesRouter;
