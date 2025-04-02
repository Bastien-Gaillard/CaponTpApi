const mongoose = require('mongoose');

const EntiteSchema = new mongoose.Schema({
    Nom1: String,
    Nom2: String,
    IdMoodle: String
});

const GroupeSchema = new mongoose.Schema({
    Libelle: String,
    Entites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entite' }]
});

const SousCritèreSchema = new mongoose.Schema({
    Desactive: Boolean,
    Reordonnable: Boolean,
    Pourcentage: Number
});

const CritèreSchema = new mongoose.Schema({
    Coefficient: Number,
    Desactive: Boolean,
    SousCritères: [SousCritèreSchema]
});

// Modèle pour une evaluation
const EvaluationSchema = new mongoose.Schema({
    Nom: String,
    Date: Date,
    Template: {
        Critères: [CritèreSchema]
    },
    Entites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entite' }]
});

const Entite = mongoose.model('Entite', EntiteSchema);
const Groupe = mongoose.model('Groupe', GroupeSchema);
const Evaluation = mongoose.model('Evaluation', EvaluationSchema);

module.exports = { Entite, Groupe, Evaluation };
