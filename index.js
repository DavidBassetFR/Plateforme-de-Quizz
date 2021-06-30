require('dotenv').config();

const express = require('express');
const router = require('./app/router');
const varInitMiddleware = require('./app/middlewares/varInit');
const session = require('express-session');

const PORT = process.env.PORT || 3000;

const app = express();

// Le middleware de static c'est un router !
// Qui va se charge de vérifier qi un fichier correspont à la requête http
// Il passera en revue toutes les possibilités du dossier défni comme étant static. Si vous demandez un fichier nommé michel.html, il va vérifier que celui-ci existe dans le repertoire, si ce n'est pas le cas il ira vérifier les routes présentes dans router.js. S'il n'y a aucune route michel.html, on aura une page 404, par défaut, fourni par express
// Souci, si dans votre répertoire vous avez un index.html et que vous demandez la route / il va considérer qu'il devra renvoyer le contenu de index.html, et il n'aura même pas l'occasion d'aller vérifier qi une route / existe dans router.js. Car les fichiers index.html, historiquement sont les fichiers par défaut lors de l'appel d'une repertoire (c'est à dire les routes finissant par un /)
app.use(express.static('./static'));

// On spécifie le moteur de rendu et ou se trouve les fichiers
app.set('view engine', 'ejs');
app.set('views', './app/views');

//Afin de récupérer le payload (le corp du message) d'un requête on doit utiliser un moddleware de gestion de payload. Il est fourni par express. on peut le mettre où l'on veut, mais il faut absolument qu'il soit avant le router, afin que les controller puisse lire le contenu.
app.use(express.urlencoded({ extended: true }));
// Maintenant dans chaque requête post, je vais pouvoir lire une propriété "body"

app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: 'Un Super Secret'
}));

// Un petit middleware maison afin d'initialiser des variables utiles dans la réponse.
// ici on la créer pour initialisé une propriété user en objet vide et ne pas générer d'erreur quand aucun utilisateur n'encore été récupéré
app.use(varInitMiddleware);
// Il serait surcharger dans le router si on récupère une utilisateur de la base ou d'un formulaire


app.use(router);


app.listen(PORT, _ => console.log(`Listening on http://localhost:${PORT}`));