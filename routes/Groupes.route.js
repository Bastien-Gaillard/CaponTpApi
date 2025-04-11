// routes/groupes.js
const express = require("express");
const router = express.Router();
const { Groupe, Entite } = require("../models");

// Création d'un groupe
// routes/groupes.js
// routes/groupes.js
router.post("/", async (req, res) => {
    try {
      console.log("=== POST /groupes - Création d'un groupe ===");
      console.log("Données reçues:", req.body);
      
      let { libelle, entites } = req.body;
      
      // Si 'entites' arrive en tant que chaîne, on le parse pour obtenir un tableau
      if (typeof entites === "string") {
        entites = JSON.parse(entites);
      }
      
      let entiteIds = [];
      
      // Si 'entites' est un tableau, on le traite
      if (Array.isArray(entites)) {
        entiteIds = await Promise.all(
          entites.map(async (ent) => {
            // Si un élément de 'entites' est une chaîne, on le parse pour obtenir l'objet
            if (typeof ent === "string") {
              try {
                ent = JSON.parse(ent);
              } catch (e) {
                throw new Error("Impossible de parser l'entité: " + ent);
              }
            }
            
            // Si l'entité n'a pas de _id, on la crée dans la base de données
            if (!ent._id) {
              const newEntite = new Entite({
                nom1: ent.nom1,
                nom2: ent.nom2,
                idMoodle: ent.idMoodle,
              });
              await newEntite.save();
              return newEntite._id;
            }
            // Sinon, on retourne son _id
            return ent._id;
          })
        );
      }
      
      // On reconstruit le payload avec uniquement des ObjectId pour 'entites'
      const correctedData = {
        libelle: libelle.toLowerCase(), // transformation du libellé
        entites: entiteIds,
      };
      
      const groupe = new Groupe(correctedData);
      await groupe.save();
      
      console.log("Groupe créé:", groupe);
      res.status(201).json(groupe);
    } catch (error) {
      console.error("Erreur création du groupe:", error.message);
      res.status(400).json({ error: error.message });
    }
  });
  

// Récupération de tous les groupes avec leurs entités peuplées
router.get("/", async (req, res) => {
  try {
    console.log("=== GET /groupes - Récupération des groupes ===");
    const groupes = await Groupe.find().populate("entites");
    res.json(groupes);
  } catch (error) {
    console.error("Erreur récupération des groupes:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Mise à jour d'un groupe
// Dans routes/groupes.js
router.put("/:groupId", async (req, res) => {
    try {
      const { groupId } = req.params;
      console.log("=== PUT /groupes/:groupId - Modification d'un groupe ===");
      console.log("Données reçues:", req.body);
      
      let { libelle, entites } = req.body;
      
      // Traiter chaque entité : 
      // - Si l'objet possède un _id, c'est une entité existante.
      // - Sinon, créer l'entité et récupérer son _id.
      if (entites && entites.length > 0) {
        entites = await Promise.all(
          entites.map(async (ent) => {
            if (typeof ent === "object") {
              if (ent._id) {
                return ent._id;
              } else {
                // Création de l'entité dans la BDD
                const newEntite = new Entite({
                  nom1: ent.nom1,
                  nom2: ent.nom2,
                  idMoodle: ent.idMoodle,
                });
                await newEntite.save();
                return newEntite._id;
              }
            }
            // Si c'est déjà un identifiant (string), on le retourne directement
            return ent;
          })
        );
      }
      
      const updatedData = {
        libelle: libelle.toLowerCase(),
        entites: entites,
      };
      
      const updatedGroup = await Groupe.findByIdAndUpdate(groupId, updatedData, { new: true });
      if (!updatedGroup) {
        return res.status(404).json({ error: "Groupe non trouvé" });
      }
      console.log("Groupe mis à jour:", updatedGroup);
      res.json(updatedGroup);
    } catch (error) {
      console.error("Erreur mise à jour du groupe:", error.message);
      res.status(400).json({ error: error.message });
    }
  });
  

// Suppression d'un groupe
router.delete("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    console.log("=== DELETE /groupes/:groupId - Suppression d'un groupe ===");
    
    const deletedGroup = await Groupe.findByIdAndDelete(groupId);
    if (!deletedGroup) {
      return res.status(404).json({ error: "Groupe non trouvé" });
    }
    console.log("Groupe supprimé:", deletedGroup);
    res.json({ message: "Groupe supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression du groupe:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Création d'une entité et rattachement à un groupe
router.post("/:groupId/entites", async (req, res) => {
  try {
    const { groupId } = req.params;
    console.log("=== POST /groupes/:groupId/entites - Ajout d'une entité ===");
    console.log("Group ID:", groupId);
    console.log("Données reçues:", req.body);
    
    const { nom1, nom2, idMoodle, Nom1, Nom2, IdMoodle } = req.body;
    const correctedData = {
      nom1: nom1 || Nom1,
      nom2: nom2 || Nom2,
      idMoodle: idMoodle || IdMoodle,
    };
    
    const newEntity = new Entite(correctedData);
    await newEntity.save();
    
    const updatedGroup = await Groupe.findByIdAndUpdate(
      groupId,
      { $push: { entites: newEntity._id } },
      { new: true }
    );
    
    if (!updatedGroup) {
      return res.status(404).json({ error: "Groupe non trouvé" });
    }
    res.status(201).json({ group: updatedGroup, createdEntity: newEntity });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'entité:", error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
