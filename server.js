const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const entiteRoutes = require('./routes/Entites.route');
const groupeRoutes = require('./routes/Groupes.route');
const evaluationsRoutes = require('./routes/Evaluations.route');




const app = express();
app.use(cors());
app.use(bodyParser.json());
mongoose.connect('mongodb://127.0.0.1:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connecté à MongoDB");
}).catch((err) => {
  console.error("Erreur de connexion à MongoDB", err);
});

// Modèle pour le client (customer)
const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const Customer = mongoose.model('Customer', customerSchema);

// Modèle pour le produit (product)
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
});

const Product = mongoose.model('Product', productSchema);

// Modèle pour les avis clients (reviews)
const reviewSchema = new mongoose.Schema({
  customer_id: mongoose.Schema.Types.ObjectId,
  product_id: mongoose.Schema.Types.ObjectId,
  rating: Number,
  comment: String,
  review_date: Date
});

const Review = mongoose.model('Review', reviewSchema);

// Modèle pour l'historique de navigation (browsing_history)
const browsingHistorySchema = new mongoose.Schema({
  customer_id: mongoose.Schema.Types.ObjectId,
  browsing_history: [{
    product_id: mongoose.Schema.Types.ObjectId,
    timestamp: Date
  }]
});

const BrowsingHistory = mongoose.model('BrowsingHistory', browsingHistorySchema);

// 2️⃣ Suppression des collections existantes (optionnel)
async function dropCollections() {
  try {
    await mongoose.connection.dropCollection('customers');
    await mongoose.connection.dropCollection('products');
    await mongoose.connection.dropCollection('reviews');
    await mongoose.connection.dropCollection('browsinghistories');
    console.log('Collections supprimées');
  } catch (error) {
    console.log('Erreur lors de la suppression des collections :', error);
  }
}

// 3️⃣ Insertion des données

async function insertData() {
  try {
    // Insertion des clients
    const customer1 = await Customer.create({ name: "John Doe", email: "john.doe@example.com" });
    const customer2 = await Customer.create({ name: "Jane Smith", email: "jane.smith@example.com" });

    // Insertion des produits
    const product1 = await Product.create({ name: "Produit A", description: "Description du produit A", price: 199.99 });
    const product2 = await Product.create({ name: "Produit B", description: "Description du produit B", price: 299.99 });
    const product3 = await Product.create({ name: "Produit C", description: "Description du produit C", price: 150.00 });

    // Insertion des avis clients
    await Review.insertMany([
      {
        customer_id: customer1._id,
        product_id: product1._id,
        rating: 5,
        comment: "Superbe qualité, je suis très satisfait !",
        review_date: new Date("2024-04-03T10:00:00Z")
      },
      {
        customer_id: customer2._id,
        product_id: product2._id,
        rating: 4,
        comment: "Bon produit mais un peu cher.",
        review_date: new Date("2024-04-02T15:30:00Z")
      }
    ]);

    // Insertion de l'historique de navigation
    await BrowsingHistory.insertMany([
      {
        customer_id: customer1._id,
        browsing_history: [
          { product_id: product1._id, timestamp: new Date("2024-04-02T14:30:00Z") },
          { product_id: product2._id, timestamp: new Date("2024-04-02T15:00:00Z") }
        ]
      }
    ]);

    console.log("Données insérées avec succès");
  } catch (err) {
    console.error("Erreur lors de l'insertion des données:", err);
  }
}

// Exécution des étapes : suppression des collections (optionnel), puis insertion des données
async function run() {
  await dropCollections();
  await insertData();
}

run();
app.listen(3000, () => console.log('Server running on port 3000'));
