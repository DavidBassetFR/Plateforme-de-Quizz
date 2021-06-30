const { Tag } = require('../models');

module.exports = {

    tag: async (request, response, next) => {
        try {
            // Grâce à la règle de route en expression régulière, je n'ai pas besoin de tester si la valeur envoyé en paramèter de route est un nombre entier.
            const tag = await Tag.findByPk(request.params.id, {
                include: { 
                    association: 'quizzes',
                    include : 'author'
                }
            });

            // par contre je dois encore vérifier que le tag a bien été trouvé.
            if(!tag){
                return next();
            }

            response.render('tag', { tag });
        } catch (error) {
            response.status(500).render('tags', { tags: [], error: `Une erreur est survenue` });
        }
    },

    // Express gère parfaitement les les function async !
    tagList: async (request, response) => {
        // sans gérer les erreurs
        /*
        const tags = await Tag.findAll();
        response.render('tags', { tags });
        */
        // Avec gestion d'erreurs
        try {
            // Atend le retour de la BDD
            const tags = await Tag.findAll();
            // Seulement ensuite renvoi la page
            response.render('tags', { tags });
        } catch (error) {
            // on peut quand même affiché l'objet d'erreur en console, histoire de voir ce qui s'est passé

            response.status(500).render('tags', { tags: [], error: `Une erreur est survenue` });
        }
    },

    tagListSansAsync: (request, response) => {
        // sans gérer les erreurs
        Tag.findAll().then(tags => {
            response.render('tags', { tags });
        });
        /*
        Tag.findAll().then(tags => {
            response.render('tags', { tags });
        }).catch(error => {
            console.error(error);
            response.status(500).render('tags', { tags: {}, error: `Une erreur est survenue` });
        });

        */
    }

}