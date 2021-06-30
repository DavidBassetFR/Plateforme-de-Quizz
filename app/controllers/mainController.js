// Il récupère l'index quand aucun fichier n'est précisé
// S'il n y a pas d'index, cela générera une errur
const { Quiz, User } = require('../models');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');

module.exports = {

    // Middleware chargé de répondre à la requête du navigateur
    homePage: async (request, response) => {

        try {

            const quizList = await Quiz.findAll({
                include: 'author'
            });

            // si on ne met pas le await avant Quiz.find on récupère l'instance de promesse, et on peut voir que cette instance est dans un status "pending" (en attente de récupération de donnée ou d'erreur)
            response.render('index', { quizList });

        } catch (error) {
            console.error(error);
        }

    },

    pageNotFound: (_, response) => {
        response.status(404).render('notFound');
    },

    signupPage: (_, response) => {
        response.render('signup');
    },

    signupAction: async (request, response) => {

        try {

            response.locals.formData = request.body;

            if (!emailValidator.validate(request.body.email)) {
                return response.render('signup', {
                    error: "Cet email n'est pas valide.",
                    errorField: "email",
                });
            }

            if (request.body.password !== request.body.passwordConfirm) {
                return response.render('signup', {
                    error: "La confirmation du mot de passe ne correspond pas.",
                    errorField: "password",
                });
            }

            const foundUser = await User.findOne({
                where: {
                    email: request.body.email
                }
            })

            if (foundUser) {
                return response.render('signup', {
                    error: "Cet email est déjà présent dans notre base de données",
                    errorField: "email",
                });
            }

            const passwordHashed = await bcrypt.hash(request.body.password, 10);

            // await peut être utiliser sans que le retour de la promesse ne soit stocké dans une variable, on dit juste d'attendre avant d'effectuer les instructions suivantes
            await User.create({
                firstname: request.body.firstname,
                lastname: request.body.lastname,
                email: request.body.email,
                password: passwordHashed
            });

            response.redirect('/');
        } catch (error) {
            console.error(error);
        }

    },

    loginPage: (_, response) => {
        response.render('login');
    },

    loginAction: async (request, response) => {

        try {

            const error = "Ces informations de connexion sont incorrectes";

            const user = await User.findOne({
                where: {
                    email: request.body.email
                }
            });

            if (!user) {
                return response.render('login', {
                    error
                });
            }

            const passwordIsValid = await bcrypt.compare(
                request.body.password,
                user.password
            );


            if (!passwordIsValid) {
                return response.render('login', {
                    error
                });
            }

            //delete user.dataValues.password;

            request.session.user = {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role
            };

            response.redirect('/');
        } catch (error) {
            console.error(error);
        }
    },

    logoutAction: (request, response) => {
        // On se contente de supprimer la propriété suer de la session
        delete request.session.user;
        // Et on redirige vers la page d'accueil
        response.redirect('/');
    }

};