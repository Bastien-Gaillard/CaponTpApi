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

const SousCritereSchema = new mongoose.Schema({
    key: String,
    label: String,
    note: { type: Number, default: null },
    desactive: Boolean,
    ordre: Number,
    pourcentage: Number
});

const CritereSchema = new mongoose.Schema({
    key: String,
    label: String,
    percentage: Number,
    ordre: Number,
    note: { type: Number, default: null },
    sub_criteria: [SousCritereSchema],
    coefficient: Number,
    desactive: Boolean,
});

const EvaluationSchema = new mongoose.Schema({
    Nom: String,
    date: { type: Date, default: Date.now },
    Template: {
        type: {
            Criteres: [CritereSchema]
        },
        required: true
    },
    notes: [
        {
            entite: {
                Nom1: String,
                Nom2: String,
                IdMoodle: String
            },
            criteria: [CritereSchema],
            totalNote: Number
        }
    ]
});

const Entite = mongoose.model('Entite', EntiteSchema);
const Groupe = mongoose.model('Groupe', GroupeSchema);
const Evaluation = mongoose.model('Evaluation', EvaluationSchema);
const Critere = mongoose.model('Critere', CritereSchema);
const SousCritere = mongoose.model('SousCritere', SousCritereSchema);
module.exports = { Entite, Groupe, Evaluation, Critere, SousCritere };
