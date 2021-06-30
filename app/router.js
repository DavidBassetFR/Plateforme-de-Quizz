const express = require('express');

const { 
    mainController, 
    quizController, 
    tagController, 
    adminController
} = require('./controllers');

const adminMiddleware = require('./middlewares/adminMiddleware');
const varInit = require('./middlewares/varInit');

const router = express.Router();

router.get('/', mainController.homePage);

// Si la route est verifié, il exécute le controller et répond à la requête. Il ne va pas plus loin dans la chaîne des middlewares
router.route('/quiz/:id(\\d+)')
                .get (quizController.quiz)
                .post(quizController.getScore);


// route affichant le formulaitre non rempli
router.route('/signup')
            .get(mainController.signupPage)
            .post(mainController.signupAction);

// Quand on a la m^peme route pour 2 methodes HTTP différentes on peut utiliser cette notation, c'est un peu plus rapide.
router.route('/login')
    .get(mainController.loginPage)
    .post(mainController.loginAction);

router.get('/logout', mainController.logoutAction);

router.get('/tags', tagController.tagList);
// Ne chercher pas a trop comprendre, mais cette notation permet de valider uniquement les route ou le paramètre dynamique après /tag/ est seulement composé de chiffres. le moindre caractère qui n'est pas un chiffre fera qua la route ne sera pas vérifié, et tombera donc dans le dernier middleware affichant une page 404
router.get('/tag/:id(\\d+)', tagController.tag);

// La methode .get prend en premier arguement la restriction de route, mais ensuite on peut mettre autant de fois que l'onsouhaite des arguments contenant des middleware, ce qui nous permet de faire de vérification de continuité de chaine de middleware
router.get('/admin', adminMiddleware, adminController.homePage);


router.route('/addNewTag')
            .get (adminMiddleware, tagController.newTag)
            .post(adminMiddleware,tagController.addTag);
// Le dernier middleware de notre router est obligé de récupérer les requêtes que ne se sont pas arrêtés avant.
// Cela voudra dire une page introuvable
router.use(mainController.pageNotFound);

//! Ici on ne peut plus mettre de route, jamais cela ne dépassera notre middleware 404

module.exports = router;