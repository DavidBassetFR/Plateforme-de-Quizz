
const { Quiz, Level, Question, Answer, Tag} = require('./../models/index');
const { sequelize } = require('../models/answer')
const quizController = {

    quiz: async(request, response) => {
      const tags = await Tag.findAll();
        try {
        const quiz = await Quiz.findByPk(request.params.id, { 
            include: [
                'author',
                'tags',
                {
                    association: 'questions',
                    include: ['level', 'answers' ]
                    
                }],

                 // order :[['questions', 'level_id', 'asc'],  sequelize.random(['questions','answers', 'description'])]
                // FONCTIONNEL AFIN QUE CHAQUE QUESTION ET LE POSITIONNEMENT DE CHAQUE REPONSE CHANGE A CHAQUE ACTUALISATION  PAS UTILE DANS NOTRE CAS
                order :[['questions', 'level_id', 'asc'],  ['questions','answers', 'description', 'ASC']]
                //order: [['questions','answers', 'description', 'desc']],
            
         },)
         if (!quiz) {
            return next();
        }
        if (!request.session.user) {
            // On le renvoie sur la page login
            response.render('quiz', {quiz, tags});
            return;
        }
            
            response.render('play_quiz', {
                quiz, tags})
        } catch (error){
            console.error(error)
        }

},
getScore: async  (req, res, next) => {
    if(req.body.TagID) {
      
        const tag = await Tag.findByPk(req.body.TagID)
        const quiz = await Quiz.findByPk(req.params.id)
        quiz.addTags(tag, { through: { tag_id: req.body.TagID }});

        res.redirect(`/quiz/${req.params.id}`)
    }

let score = 0;
const hello = req.body;
console.log(hello)
 const tableau = Object.keys(req.body)
 const tableauValue  = Object.values(req.body)

 const newTableValue = []


try {
    /* Ici, je choisi de boucler en fonction de la taille de mon tableau.length avec une boucle "i",
     car j'utiliserais les incréments, donc autant avoir un compteurdirectement dans ma boucle */
 for (let i = 0; i < tableau.length; i++){
        const resultatX = await Answer.findOne({ where : {
            description : tableauValue[i],
            question_id : tableau[i]
    }});
        if (resultatX){
        newTableValue.push(resultatX.id);
    }

    /* Ici, la solution de facilité, ça aurait été de dire que puisque l'id de la bonne réponse est toujours égale à l'id de la question, 
    on s'embète pas, et on met dans l'input chaque answer_id et en name chaque question_id. Un problème survient si une personne regarde le code source
    elle va rapidement pouvoir trouver chaque réponse.
    Pour cela, je préfère faire en sorte d'envoyer l'id de la question, et la description de la réponse.

    J'ai donc besoin dans un premier temps d'aller récupéré l'id de l'answer, puisque je ne l'ai pas.

    Pour cela, je crée 2 tableaux, un qui va contenir les clés de mon req.body qui sera nommé tableau(Question_ID), et l'autre qui contiendra les valeurs(DESCRIPTION).
    Je vais donc avoir un tableau de clé, et un tableau de valeur.

    Quand je vais chercher mon élément dans Answer, je vais chercher l'élément qui correspond à l'ID de la question(la clé) && la description (soit la valeur).
    Je suis obligé de vérifier l'id de la question, car plusieurs réponses peuvent exister (par exemple pour le chocolat, la réponse "Noir" est présente 4 fois dans la BDD)
    */
    /* J'aurais toujours un résultat qui correspondra à resultatX, ça sera un objet où la réponse sera stockée avec toutes ses informations.
    Ce qui m'intéresse, c'est de récupérer un tableau avec TOUTES les answer_id au même index 
   /* //! ATTENTION, ON PEUT RECUPERER UNE ANSWER QUI NEST PAS LA BONNE REPONSE. 

    Maintenant, je dois aller regarder si ma clé(question_id) et que l'answer_id récupéré par la donnée dans NewTableValue dans ma class Answer, correspondent à une ligne
    dans ma table Question.
    Il faut savoir que du coup, si j'ai répondu Blanc à une question ou il fallait répondre Noir, je vais récupérer l'answer_id égal à Blanc, soit admettons 175.
    Du coup, je vais forcément récupérer une answer, qui sera disons égal à id =175, description= Blanc,  question_id = 120

    Ici, le simple fait que mon id ne soit pas égal à question_id m'indique que la réponse n'est pas bonne. Mais
    si la BDD venait à changer, ça serait bien de faire en sorte que ça fonctionne quand même.

    Donc je vais chercher dans ma class Question si il y a un id (soit question_id) = 120 && que l'answer_id affilié soit égal = 175.
    Ici, il n'y aura pas résultat concluant, donc, je n'incrémente pas mon score.

    Si oui, j'incrémente ma variable de score, sinon, je ne fais rien */
    
       const resultatZ =  await Question.findOne({ where :
            { id : `${tableau[i]}`,
            answer_id : newTableValue[i] }})
            if(!resultatZ){
                console.log("mauvaise réponse")
            } else {
                score++;
            }
 }

 /*
Ici, on va juste récupérer le quiz qui correspond au req.params.id.
Cela dit, on va pouvoir gérer l'ordre d'affichage des questions.

Dans un cas optimal, il faudrait faire en sorte de récupérer l'exacte même positionnement de questions qu'auparavant, même si la génération était RANDOM.
 
Ici, je vais préféré les classer TOUJOURS de la même façon entre mon rendu en POST et mon rendu en GET. 
Cela permettra à l'user de retrouver l'ordre des questions auquel il a répondu 

un " order :[['questions', 'level_id', 'asc'],  sequelize.random(['questions','answers', 'description'])]" 
permettrait d'afficher les questions en ordre aléatoire mais en gardant le système de difficulté en croissant.
 */
    const quiz = await Quiz.findByPk(req.params.id, { 
        include: [
            'author',
            'tags',
            {
                association: 'questions',
                include: ['level', 'answers' ]
                
            }],
            //order: [['questions','answers', 'description', 'desc']],
            order :[['questions', 'level_id', 'asc'],  ['questions','answers', 'description', 'ASC']]
     },)
     if (!quiz) {
        return next();
}
if (!req.session.user) {
    //S'il nexiste pas de sessions, on a envie que l'user puisse comtempler les quizz, sans pouvoir y jouer.
    // C'est facile, ici, je render juste une autre page ejs, où il n'y a pas de formulaire, et pas de input radio.
    // Cela donne l'illusion à l'user que la page est la même.
    res.render('quiz', {quiz});
    return;
}
// Ici, je renvois ce qu'a envoyé l'utilisateur, car je souhaite ré-utiliser les données qu'il m'a envoyé
// afin de lui signaler si ses réponses sont bonnes, ou non.
    res.render('resultatquiz', {score, quiz, hello})
} catch (error){ 
    console.error(error);
}
}};




module.exports = quizController;