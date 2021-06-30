# Callback JavaScript

## Cas d'utilisation

```javascript
function getCondiment(){
    client.query('SELECT * FROM condiment');
}

function getPlatFromCondiment(){
    client.query('SELECT * FROM plat where condiment_id = condiment.id');
}

getCondiment();
getPlatFromCondiment();
```

ici je n'ai encore recu truc.id, car les 2 requête ce sont lancés en même temps.

Pour gérer ca en série en JS on peut utiliser les callback, c'est à dire que l'on va ce contenter de fournir à la première fonction ce qu'elle doit executer une fois qu'elle à fini sont travail

```javascript
function getCondiment(callback){
    client.query('SELECT * FROM condiment');
    callback();
}
```

Je fourni la fonction non-executé à la première function, c'est la function getConfiment qui executera getPlatFromCondiment.

getCondiment(getPlatFromCondiment);

une fonction est executé a partir du moment ou l'on rajoute les parenthèses à la fin de la variable contenant la fonction

si on a une fonction stocké dans "getCondiment" il faudra y adjoindre () ==> "getCondiment()" pour l'exécuter

## Signature standard

Un callback standard il a 2 paramètres error et data

```javascript
function ceciEstUnCallbackStandard(error, data){

}
```

Les paramètre d'une fonction on appelle ça sa signature. Donc la signature standars d'un callback est "(error, data)"

## Sur un navigateur

Sur un navigateur un callback généralement rencontré n'utilise pas cette signature standard.

[documentation addEventListener](
https://developer.mozilla.org/fr/docs/Web/API/EventTarget/addEventListener)

```javascript
document.addEventListener('click', function(event){
    console.log(event);
});
```

Ici le callback a des paramètres différents, le premier n'est pas une erreur, c'est l'objet contenant l'éévenement qui vient d'être déclenché.
mais n'empêche pas le fait que ce soit un callback, il juste pas standard.

En node on preférera utiliser le callback standard. D'ailleurs le module pg l'utilise

```javascript
client.query('SELECT * FROM condiment', function(error, result) {

});
```

## L'enfer des callback

Une image peut prendre du temps à se télécharger, et j'aimerais être prévenu quand l'image est enfin téléchargé.

```javascript
img.load(function(error, data){
    console.log('img chargée');
});
```

Si j'ai plusieurs images à chargé c'est super pratique je peux lancé le télchargement de plusieurs images en même temps.

```javascript
img.load(function(error, data){
    console.log('img chargée');
});

img2.load(function(error, data){
    console.log('img2 chargée');
});

img3.load(function(error, data){
    console.log('img3 chargée');
});
```

Mais imaginons que j'ai besoin d'attendre que la première image soit téléchargé avant dans retéléchargé une nouvelle. Car le serveur de téléchargement me restreint à un téléchargement à la fois.

```javascript
img.load(function(error, data){

    if(error){
        return console.error('Une erreur pour img');
    }
    console.log('img chargée');

    img2.load(function(error, data){
        if(error){
            return console.error('Une erreur pour img2');
        }
        console.log('img2 chargée');

        img3.load(function(error, data){
            if(error){
                return console.error('Une erreur pour img3');
            }
            console.log('img3 chargée');
        });
    });
});
```

Ca imaginez le avec 50 images… Cela s'appelle le callback hell !

## Version avec les .then

On peut représenté le callback hell précédent avec une nouvelle notation que l'on a découvert avec sequelize le .then

```javascript
img.load().then(function(data){

    console.log('img chargée');

    img2.load().then(function(data){
        console.log('img2 chargée');

        img3.load().then(function(data){
            console.log('img3 chargée');
        });
    });
}).catch(function(error){
    return console.error('Une erreur pour une des images');
});
```

Première amélioration la gestion des erreurs, celles-ci sont toutes redirigé vers le seul catch de la première execution d'instruction. Ce n'est pas un souci, car l'erreur qui est à été fatal (donc qui a arrêté l'execution du script) est renvoyé dans le paramètre du catch (error). Donc on peut identifier le problème.

Donc cette version est un plus succinte, mais d'ailleur comment ca se fait que que l'on puisse récupéré toutes les errurs au même endroit ?

Parce qu'en fait on vient d'utiliser quelque chose de tout nouveau. ce n'est pas juste une autre possibilité d'organisation des callback.

Cette organisation d'instruction utilise les PROMESSES ! ([Promise](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Promise))

```javascript
const promise1 = new Promise((resolve, reject) => {
    img3.load(function(){
        if(sucess === true){
            resolve('img chargée');
        }else{
            reject('une erreur avec plein de détails');
        }
    });
});

promise1.then((value) => {
  console.log(value);
}).catch(error => {
    console.error(error);
});

console.log(promise1);
```

Le problème, au delà de la compléxité pour créer soit-même une promesse, c'est que l'on conserve une sorte de then hell.

## async/await

Pourquoi on parle de async et d'await en même temps ?
Parce l'un ne va pas sans l'autre, l'autre ne pas sans l'un.

await = attendre : attendre qu'une instruction est reçu un résultat.

async = asynchrone != synchrone : cela permet de définir un contexte asynchrone.

Le contexte async sera toujours défini sur une fonction.

```javascript
function async run(){

}

async run() => {

}
```

await sera toujours utiliser avant l'éxecution d'un function qui prendre un certain temps à se résoudre. Donc en fait il permet d'attendre qu'une promesse soit résolu (resolve).

On est obligé de définir le contexte async, alors que javascript est de base asynchrone, pour lui préciser qu'a l'intérieur de cette fonction on va devoir attendre des résultat. Du coup javascript va en quelque sorte se préparer à gérer ce genre de chose. (il va s'échauffer)

Les 2 code suivants sont strictement identiques. Seul la façon d'écrire est différente.

```javascript
function async run(){
    await img.load().then(function(){
        console.log(data);
    });
}
```

```javascript
function async run(){
    const data = await img.load();
    console.log(data);
}
```

Ok donc si c'est la même chose pourquoi faire de 2 façons différentes ?

.then est arrivé en 2015, async en 2017. Et selon le contexte et le goût des uns et le goût des autres l'usage varie. En vrai il y a une différence, mais elle ne se situe pas au nibeau du résultat mais au niveau des erreurs. Enfin pour les résultat c'est quan même vachement plus simple avec async await. voyez vous même : <

Dans le code suivant il ne va chargé les 3 images en même temps, mais il va attendre que chaque image soit chargée avant de passer à la suivante.

```javascript
function async run(){
    const data = await img.load();
    console.log(data);
    const data = await img2.load();
    console.log(data);
    const data = await img3.load();
    console.log(data);
}
```

Waouh !! C'est quand même vachement plus lisible.

Ca ressemble à du synchrone du coup ? Oui mais ça ne l'ai pas.
Le async/await n'arrête le'eventloop du moteur JS (la petite roue qui tourne tout le temps dans le moteur).

Le async/await simule du synchrone, donc on garde les avantage de l'asynchrone de JS tout en ayant la lisibilté du synchrone.

Ok super, mais la gestion des errurs du coup ? on fait comment ?

## Gestion des erreurs générales en JS (Mais aussi dans d'autres langages)

Quand une erreur fatale intervient dans un code javascript. L'arreur est affiché dans la console, avec différentes informations concernant cette erreur, et le script s'arrête (javascript ne continue pas à l'interprêter)

```javascript
uneVariableIndefini;

console.log(`Ce message ne va pas s'afficher`);
```

Il est tout à fait possible de ne pas faire en sorte que le script s'arrête suite à une erreur. Pour cela on peut englober une serie d'instruction qui sera ser tester avant d'être exécuté, et si erreur il y a, elle sera rediirgé vers un autre bloc qui est chargé de la gérer.

Cela s'appelle un try{}cacth(){}

L'un de va pas s'en l'autre et l'autre ne va pas s'en l'un.
Outre l'intérêt de ne pas stopper l'exécution du script complet on peut affiché ou transférer l'erreur autre part. Par exemple dans un fichier de log.

```javascript
try {
  uneVariableIndefini;
} catch(error) {
  console.error(`uneVariableIndefini n'existe pas`);
  ecrisDansLefichierDeLog(error);
}

console.log(`Ce message va s'afficher`);
```

Et bien se système de récupération est tout a fait adapté à l'utilisation de async/await. En fait quand on await une exécution il renvoi l'erreur dans un "return" ou il "lève" une erreur qui est catchable (attrapable) dans un doucble bloc "try catch".

```javascript
function async run(){
    try {
        const data = await img.load();
        console.log(data);
        const data = await img2.load();
        console.log(data);
        const data = await img3.load();
        console.log(data);
    }catch(error){
        console.error(error);
    }
}
```

On peut vouloir une gestion différencier et que l'image 2 soit chargée que l'image soit un succèe ou une erreur. Dans ce cas on va utiliser une try cactch pour chaque chargement.

```javascript
function async run(){
    try {
        const data = await img.load();
        console.log(data);
    } catch(error) {
        console.error(error);
    }

    try {
        const data = await img2.load();
        console.log(data);
    } catch(error) {
        console.error(error);
    }

    try {   
        const data = await img3.load();
        console.log(data);
    } catch(error) {
        console.error(error);
    }
}
```

Bon allez, la théorie c'est bien, mais on veut pratiquer !!
