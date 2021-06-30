# Architecture Roadmap

1. `npm init -y`
2. `npm i …`
3. pojnt d'entrée `/index.js`
4. Création du répertoire `/app`
   1. Dossier `models`
   2. Dossier `controllers`
   3. Dossier `views`
   4. Dossiers optionnels `routers`, `services` (Couche métier, ce qui est particulier à votre application, ce qui n'est standard)
5. Création du répertoire qui accueille les fichiers statiques. (fichiers qui ne sont pas dynamiques, images; fichier html, pdf, css, js client).
6. Fichier contenant les variables d'environnements.