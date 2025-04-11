// models.js
const mongoose = require('mongoose');

const EntiteSchema = new mongoose.Schema({
    nom1: { type: String, required: true },
    nom2: { type: String, required: true },
    idMoodle: { type: String, required: true }
}, { timestamps: true });

const GroupeSchema = new mongoose.Schema({
    libelle: { type: String, required: true },
    entites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entite' }]
}, { timestamps: true });

const SousCritereSchema = new mongoose.Schema({
    key: String,
    label: String,
    note: { type: Number, default: null },
    desactive: Boolean,
    ordre: Number,
    pourcentage: Number,
    // Ajout de la propriété remark
    remark: { type: String, default: "" }
});

const CritereSchema = new mongoose.Schema({
    key: String,
    label: String,
    percentage: Number,
    ordre: Number,
    note: { type: Number, default: null },
    // Ajout de la propriété remark
    remark: { type: String, default: "" },
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
