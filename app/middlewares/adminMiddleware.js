/**
 * Je suis un videur
 */

//Si tu as le droit je te laisse passé, sinon je te redirige gentillement vers la page d'accueil

module.exports = (request, response, next) => {

    if(
        // On est pas connecté
        !request.session.user || 
        // On est connecté mais sans le role admin
        (request.session.user && request.session.user.role !== 'admin'
    )){
        return response.redirect('/');
    }

    // tu peux continuer ton chemin
    next();
}