# Fonctionnements des variables accessibles dans une vue sur un serveur Express

Quand on parle de variable accessible dans une vue, on fait référence à un objet global accessible dans une vue. On peut pointer directement sur celui-ci en utilisant la variable qui contient cet objet ==> "locals.test", ou bien utiliser plus simplement une de ses propriétés ==> "test".

Ca c'est l'utilisation au niveau de la vue (de rendu).
Au niveau du serveur express c'est un peu plus complexe que cela.

On peut injecter de nouvelles propriété dans cet objet a diférent niveau de le l'application.

## 1er niveau

Le niveau le plus haut, c'est l'application elle-même.

```javascript
const app = express();

app.locals.propriéeteDePremierNiveau = {
    appName: 'Le plus beau site du monde',
    appVersion : 'v0.1.2'
};
```

Un propriété défini à ce niveau existera tanat que l'application tournera, elle n'evoluera pas au fil de requêtes HTTP.

Cela peut être utile pour stocker des valeurs partagées par toutes les requêtes. Par exemple un JSON contenant des données de configurations.

Ces propriété seront accessible dans les vues.

## 2ème niveau

Ensuite on peut faire varier les propriété présentes dans les locals en fonction de la requête HTTP.

Pour cela on va stocker une nouvelle propriété dans les locals de l'objet de reponse, accessible dans les middlewares d'Express.

```javascript
function (request, response, next){
    response.locals.user = {
        name: request.session.lastname,
        pseudo: request.session.username
    }
    next();
}
```

Cela permet de créer un middleware de transition afin d'y stocker des informations provenant de la requête de l'utilisateur, et ainsi ne pas répéter les même instructions dans les différents controller qui auraient besoin de renvoyer ces données au vues.

## 3ème niveau

On peut également créer de nouvelle propriété dans locals à travers l'objet que l'on founi en tant que 2èeme argument de la méthode render().

```javascript
function monController (request, response, next){
    response.render('mavue', { 
        title: 'Le titre de ma page', 
        cssClass: 'main' 
    });
}
```

Cela est utile dans la majorité des cas afin d'envoyer des données qui sont directement lié a une route particulière. Cela peut être des données provement d'une requête SQL, ou bien seulement de qualification manuel pour la page courante.

## 4ème niveau

On peut pousser la personnalisation encore plus loin en passant de façon explicite de nouvelles propriétés, lors de l'inclusion d'un "partials" de vue. en les précisant sous forme de tableau en tant que 2ème argument de la function include(), au même titre que la function render() dans un controller.

Si jamais une des données on été renseignés dans l'un des niveau précédent elles seront automatiquement accessible dans le "partials". Par contre si l'informations a été stocké au niveau de la vue principale (dans le cas d'une boucl for par exemple) il faudra forcément le renseigné de cette manière, de façon explicite.

## Comment cela se passe t'il techniquement parlant ?

les locals on a dit que c'était un objet global accessible dans une vue à travers le mot "locals"

Imaginons donc une variable qui est accessible dans les vues que l'on a défini à la racine de notre application. En vrai c'est pas vraiment comme cela, mais c'est simple pour se le représenter.

```javascript
const locals = {};
```

Cet objet va être rempli au fur et à mesure que l'application se lance ou qu'ell répond à une requête.

1. On lance le serveur `node .`

```javascript
locals.appName = 'Le plus beau site du monde',
locals.appVersion = 'v0.1.2'
console.log(locals);
/*
{
    appName: 'Le plus beau site du monde',
    appVersion : 'v0.1.2'
}
*/
```

2. Un première requête est exécuté. elle passe par le middleware génrale de stockage d'infos user

```javascript
locals.name = request.session.lastname,
locals.pseudo = request.session.username
console.log(locals);
/*
{
    appName: 'Le plus beau site du monde',
    appVersion : 'v0.1.2',
    name : 'Guilloux,
    pseudo : 'Yannou'
}
*/
```

3. on appelle le render avec un objet global

```javascript
locals.title = 'Le titre de ma page', 
locals.cssClass = 'main' 
console.log(locals);
/*
{
    appName: 'Le plus beau site du monde',
    appVersion : 'v0.1.2',
    name : 'Guilloux,
    pseudo : 'Yannou',
    title : 'Le titre de ma page',
    cssClass : 'main' 
}
*/
```

4. pour les include cela ne rentre pas dans l'objet local

5. On refait une requête vers le serveur

avant toute prise en compte par un controller l'objet resseble à :

```javascript
{
    appName: 'Le plus beau site du monde',
    appVersion : 'v0.1.2'
}
```

Les propriété du niveau 1 sont toujours présentes, les autres ont disparues.
