const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bookRoad = require('./routes/book');
const userRoad = require('./routes/userInformation');
const path = require('path');

const app = express();

mongoose.connect('mongodb+srv://dra_moh:BDYaSbUjm1pyt4eO@cluster0.i9jcq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));
//
app.use(cors());
//help use to manage the req body entrance
app.use(bodyParser.json());
//Appel du router dans app.js
app.use('/api/books', bookRoad);
app.use('/api/auth', userRoad);
//Une route static pour notre server pour lui indiquer la marche à suivre pour afficher l'image.
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;