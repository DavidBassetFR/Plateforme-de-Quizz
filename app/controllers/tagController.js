const { Tag } = require('../models');

module.exports = {

    tag: async (request, response, next) => {
        try {
            const tag = await Tag.findByPk(request.params.id, {
                include: { 
                    association: 'quizzes',
                    include : 'author'
                }
            });

            if(!tag){
                return next();
            }

            response.render('tag', { tag });
        } catch (error) {
            response.status(500).render('tags', { tags: [], error: `Une erreur est survenue` });
        }
    },

    tagList: async (request, response) => {
        try {
            const tags = await Tag.findAll();
            response.render('tags', { tags });
        } catch (error) {
            response.status(500).render('tags', { tags: [], error: `Une erreur est survenue` });
        }
    },

    tagListSansAsync: (request, response) => {
    
        Tag.findAll().then(tags => {
            response.render('tags', { tags });
        }).catch(error => {
            console.error(error);
            response.status(500).render('tags', { tags: {}, error: `Une erreur est survenue` });
        });
    },

    newTag : async (request, response) => {
        try {
            const tags = await Tag.findAll();
            response.render('newTag', { tags });
        } catch (error) {
            response.status(500).render('tags', { tags: [], error: `Une erreur est survenue` });
        }


    },

    addTag: async (request, response) => {
       
        console.log(request.body)

        //En fonction de ce qui est dans ma request.body, j'effectue des opérations d'update, ou de create.
        if (request.body.themeUpdate){
            await Tag.update({ name: request.body.themeUpdate[1] }, {
                where: {
                  id: request.body.themeUpdate[0]
                }
              });
              response.redirect('/addNewTag')  
        }
        if(request.body.newTag) {
        const ok = await Tag.findOne({ where : {
             name : request.body.newTag}})
            console.log(ok);
            if(ok !== null){
                const tags = await Tag.findAll();
                response.render('newTag', {
                    error : "Ce thème existe déjà",
                    tags
                })
            }
        
             if(ok === null){
                await Tag.create({ name : request.body.newTag})
                response.redirect('/addNewTag')
             }
        } 
              
}};