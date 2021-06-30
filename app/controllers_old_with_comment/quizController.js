const { Quiz } = require('../models');

module.exports = {

    quiz: (request, response, next) => {
        //NTUI : Never Trust User Input
        const id = parseInt(request.params.id, 10);
        // ParseInt va essayer de determiner un nombre entier.
        // Number("5.345") ===> 5.345
        // +"5.345" ===> 5.345
        // parseInt("5.345") ====> 5
        //
        // Number("56pter") ===> NaN
        // +"56pter" ===> NaN
        // parseInt("56pter") ===> 56

        if (isNaN(id)) {
            // je renvoi vers une erreur clients
            // Famille de code http : 400
            // Dans tout les cas ici on ne pourra pas récupérer de quiz, donct on peut considérer c'est une resource introuvablme, donc une erreur 404. Au même titre qu'une page introuvable

            //response.status(404).send('page introuvable');
            //response.status(404).render('notFound');
            return next();
        }

        Quiz.findByPk(id, {
            include: [
                'author', 
                'tags', 
                // 'questions' === {association: 'questions'}
                // sauf que sous forme d'objet, je vais pouvoir ajouter des informations supplémentaires, dont l'ajout de "sous-association" dans question.
                // E, l'occurence ici, on veut récupérer l'ensemble des réponse possibles et le libellé de son niveau
                {
                    association: 'questions',
                    include: ['level', 'answers']
                }
            ]
        }).then(quiz => {

            // Le fait de ne pas trouvé de quiz correspondant au nombre entier fourni peut être considéré comme une page 404
            // Ici on n'utilise pas de else, car cela rend plus lisible le code. inconvénient si on rentre dans le if, cela n'arrête l'exécution de la méthode en cours.
            if (!quiz) {
                // Pour arrêter l'exécution de la function on utilise le mot clé return la// Rappel : return renvoi une valeur en retour d'exécution de function ET stop l'exécution de celle-ci
                // On peut très bien utilisé l'instruction :
                // return;
                // cela stop l'exécution sans rien retourner
                // afin de minimiser le nombre ligne ici on retourne ce que que renvoi next() mais on ne s'en servira pas.
                return next();
            }

            //response.render('quiz', quiz );
            // On préfèrera l'envoi de donné de quiz à travers une propriété quiz que l'ensemble des propriété de quiz à la racine de la vue.
            // Au ca ou un jour on doive renvoyer d'autres informations
            response.render('quiz', { quiz });

        }).catch(error => {
            console.error(error);
        });
    }

};