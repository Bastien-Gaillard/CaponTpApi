const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const entiteRoutes = require('./routes/Entites.route');
const groupeRoutes = require('./routes/Groupes.route');
const evaluationsRoutes = require('./routes/Evaluations.route');
const critereRoutes = require('./routes/Criteres.route');
const sousCritereRoutes = require('./routes/SousCriteres.route');

mongoose.connect('mongodb://127.0.0.1:27017/evaluation', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connecté à MongoDB");
}).catch((err) => {
  console.error("Erreur de connexion à MongoDB", err);
});


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/entites', entiteRoutes);
app.use('/groupes', groupeRoutes);
app.use('/evaluations', evaluationsRoutes);
app.use('/criteres', critereRoutes);
app.use('/sous-criteres', sousCritereRoutes);





app.listen(3000, () => console.log('Server running on port 3000'));
