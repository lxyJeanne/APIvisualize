# AX PRO application de visualisation des informations sur les alarmes guide de l'utilisateur

Ceci est une application full-stack comprenant un front-end en React et un back-end en Flask. Cet article vous guidera pour exécuter ce projet localement.

## Prérequis

Avant de commencer, assurez-vous que les logiciels suivants sont installés sur votre ordinateur :

- **Node.js**：utilisés pour exécuter et gérer les dépendances du front-end. Vous pouvez les télécharger depuis [le site officiel](https://nodejs.org/) de Node.js.
- **Python 3**：utilisé pour exécuter le serveur Flask back-end. Vous pouvez le télécharger depuis [le site officiel](https://www.python.org/) de Python.

## Télécharger le fichier

Tout d'abord, téléchargez le fichier Zip et décompressez-le.

Ouvrez CMD ou Bash, et accédez au répertoire :
```sh
cd C:\Users\User.name\Desktop\APIvisual-master # remplacez par le chemin réel du dossier
```

## Installer les dépendances :

**Back-end**

Copiez le texte ci-dessous dans CMD :
```sh
cd Flask
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
Si le serveur démarre avec succès, vous verrez :
```sh
 * Serving Flask app 'app'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://10.198.67.90:5000  #主机本地IP地址
Press CTRL+C to quit
```

**Front-end**

Copiez le texte ci-dessous dans CMD :
```sh
cd ../apivisual
npm install # installer les bibliothèques de dépendances
```
Trouvez l'adresse IP de l'hôte du back-end et copiez http://(Adresse IP) dans apiConfig.js, remplacez BASE_URL et sauvegardez avec Ctrl+S.

Chemin du fichier : apivisual\src\apiConfig.js
```sh
// Exemple de apiConfig.js
const BASE_URL = 'http://10.198.67.90:5000'; # Remplacez par votre adresse IP réelle, comme indiqué lors du démarrage du serveur
```
Démarrez l'interface front-end :
```sh
npm start
 ```
Si l'interface démarre avec succès, elle ouvrira automatiquement le navigateur. Vous pouvez également ouvrir manuellement http://localhost:3000.

## Problèmes courants
1. **Je vois un message d'erreur indiquant que certains modules sont introuvables, que dois-je faire ?**

   Assurez-vous d'avoir correctement installé toutes les dépendances en suivant les étapes ci-dessus. Si le problème persiste, essayez de supprimer le dossier node_modules et le fichier package-lock.json, puis exécutez à nouveau npm install :

    ```sh
    rm -rf node_modules package-lock.json
    npm install
    ```
2. **Comment arrêter le serveur en cours d'exécution ?**

   Pour le serveur back-end, appuyez sur Ctrl + C dans la fenêtre de terminal où vous avez exécuté python app.py.
Pour le serveur front-end, appuyez sur Ctrl + C dans la fenêtre de terminal où vous avez exécuté npm start.
3. **Comment résoudre les problèmes de politique d'exécution de PowerShell lors de l'activation de l'environnement virtuel sur Windows ?**

    I. Ouvrez PowerShell en tant qu'administrateur :

   Recherchez "PowerShell"
Faites un clic droit sur "Windows PowerShell", sélectionnez "Exécuter en tant qu'administrateur".

    II. Exécutez la commande suivante pour modifier la politique d'exécution :
    ```sh
    Set-ExecutionPolicy RemoteSigned
    ```

    III. Lorsque vous êtes invité à confirmer, tapez Y et appuyez sur Entrée :
    ```sh
    Execution Policy Change
    The execution policy helps protect you from scripts that you do not trust. Changing the execution policy might expose you to the security risks described in the about_Execution_Policies help topic at https:/go.microsoft.com/fwlink/?LinkID=135170. Do you want to change the execution policy?
    [Y] Yes  [A] Yes to All  [N] No  [L] No to All  [S] Suspend  [?] Help (default is "N"): Y
    ```
    IV. Réactivez l'environnement virtuel :
    ```sh
    venv\Scripts\Activate
    pip install -r requirements.txt
    python app.py
    ```

Si vous rencontrez d'autres problèmes, veuillez contacter Jeanne.Liu.
