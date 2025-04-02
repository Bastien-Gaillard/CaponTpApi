const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const entiteRoutes = require('./routes/Entites.route');
const groupeRoutes = require('./routes/Groupes.route');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use('/entites', entiteRoutes);
app.use('/groupes', groupeRoutes);


app.listen(3000, () => console.log('Server running on port 3000'));
