// Il récupère l'index quand aucun fichier n'est précisé
// S'il n y a pas d'index, cela générera une errur
const { Quiz, User } = require('../models');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');

module.exports = {

    // Middleware chargé de répondre à la requête du navigateur
    homePage: (request, response) => {
        // On doit récupérer la liste des quiz de la BDD, et ce grâce à au model sequelize.
        // On doit gérer les erreurs s'il y en a
        // On doit renvoyer ces données à la vue. ---> direction la vue

        Quiz.findAll({
            // On a plusieurs façon de récupérer des informations provenant d'une ou plusieurs associations
            /*Include peut contenir : 
                une string (le nom de l'unique association à récupérer)
                un objet : quand on a d'autres précisions à fournir pour faire l'association
                un array : permmettant de fourni une liste d'associations
            */
            // Ici on demande d'inclure l'association portant l'alias 'author' ==> cet alias fais référence à l'association quiz <=> user
            include: 'author'
        }).then(quizList => {

            response.render('index', { quizList });
        });


    },

    pageNotFound: (_, response) => {
        response.status(404).render('notFound');
    },

    signupPage: (_, response) => {
        response.render('signup');
    },

    signupAction: (request, response) => {
       

        // afin de ne pas me répéeter dans l'envoi de l'ensemble des données à la vue, je stocke dans les locels (les variables accessibles dans la vue) l'ensemble des données du formulaire ?
        // Ici on s'embête a supprimer le mot de passe avant, c'est juste un passage eclair dans la mémoire vive.
        response.locals.formData = request.body;

        // L'email est-il valide ?
        if (!emailValidator.validate(request.body.email)) {
            return response.render('signup', {
                error: "Cet email n'est pas valide.",
                errorField: "email",
                //user: request.body
            });
        }

        // Les mot de passes correspondent-ils
        if (request.body.password !== request.body.passwordConfirm) {
            return response.render('signup', {
                error: "La confirmation du mot de passe ne correspond pas.",
                errorField: "password",
                //user: request.body
            });
        }

        // Est-ce qu'on a un utilisateur avec cet email en BDD ?
        // Si c'est le cas cela génère une erreur, on ne peut pas s'inscrire 2 fois, l'email est unique.
        User.findOne({
            where: {
                email: request.body.email
            }
        }).then(foundUser => {

            // Soit on l'a trouvé et on génère une errur côte réponse
            if (foundUser) {
                return response.render('signup', {
                    error: "Cet email est déjà présent dans notre base de données",
                    errorField: "email",
                    //user: request.body
                });
            }

            // On hash le pot de passe avant de le stocker
            const passwordHashed = bcrypt.hashSync(request.body.password, 10);

            // Soit il n'y pas de compte avec cet email et on peut l'ajouter à la BDD
            User.create({
                firstname: request.body.firstname,
                lastname: request.body.lastname,
                email: request.body.email,
                password: passwordHashed
            }).then(result => {
                //Si l'insertion s'est bien passé on redirige vers la page d'accueil
                response.redirect('/');
            });
        });

    },

    loginPage: (_, response) => {
        response.render('login');
    },

    loginAction: (request, response) => {


        // Normalement on doit faire des tests de validité avant la requête sequelize, on passe cette étape et on verifie directement que le compte est présent en base.

        //! on ne vrifié jamais le login/email et le mot de passe en même, déjà parce que on a aucun moyen de le faire côté postgres, on ne connais pas la clé de chiffrage. seul bcrypt la connais.
        // et de tout façon ce n'est du tout une bonne pratique

        // on récupère d'abord le compte avec le login/email et ensuite on vérifie que le mot de passe founi correspond bien au mot de passe sotcké grâce au module bcrypt et à sa méthode de comparaison

        User.findOne({
            where: {
                email: request.body.email
            }
        }).then(user => {
            if (!user) {
                return response.render('login', {
                    error: "Ces informations de connexion sont incorrectes"
                });
            }

            // Le compte existe bien on va utiliser bcrypt pour comparer le mot fourni dans le body avec le mot de passe chiffré dans la BDD
            const passwordIsValid = bcrypt.compareSync(
                // mot de passe fourni par l'utilisateur
                request.body.password,
                // mot de passe chiffré stocker en BDD
                user.password
            );


            if(!passwordIsValid){
                return response.render('login', {
                    error: "Ces informations de connexion sont incorrectes"
                });
            }

            // Bonne pratiue au supprime le mot de passe des sessions.
            // delete est un mot clé JS qui permet de supprimer une proriété d'un objet
            // @see : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/delete
            //delete request.session.user.password;
            // Mais attention on a récupérer une instance et pas un objet litéral la propriété n'est pas dans l'objet directement mais dans dataValues
            delete user.dataValues.password;

            // on connecte l'utilisateur
            request.session.user = user;

            response.redirect('/');
        });
    }

};