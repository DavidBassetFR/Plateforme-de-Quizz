module.exports = (request, response, next) => {

    if(request.session && request.session.user){
        // à partir du moment ou j'ai accès à l'objet request (donc dans TOUS les middlewares express), je peux lire/écrire les variables de session
        response.locals.user = request.session.user;
    }
    response.locals.formData = {};
    next();
}