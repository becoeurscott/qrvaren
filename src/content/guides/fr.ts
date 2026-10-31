import type { GuideContent } from "./types";

const fr: GuideContent = {
  ui: {
    guides: "Guides",
    guidesTitle: "Guides et tutoriels QR code",
    guidesSub: "Des tutoriels pas à pas pour créer, personnaliser, imprimer et partager vos QR codes avec QRVAREN.",
    read: "Lire le guide",
    minutes: "{n} min de lecture",
    steps: "Étapes",
    related: "Autres guides",
    back: "Tous les guides",
  },
  types: {
    url: {
      title: "Comment créer un QR code pour un lien",
      intro: [
        "Un QR code URL ouvre une page web dès qu'on le scanne avec l'appareil photo du téléphone. C'est le type de QR code le plus courant : utilisez-le pour envoyer vers votre site, une boutique en ligne, une page de réservation, une page d'avis, une vidéo YouTube ou n'importe quel lien.",
        "Avec QRVAREN, un QR code de lien est statique : l'adresse est enregistrée directement dans le motif. Il est donc gratuit, fonctionne sans compte et n'expire jamais, même des années après l'impression.",
      ],
      stepsTitle: "Comment faire un QR code de lien",
      steps: [
        "Collez l'adresse complète de votre page dans le champ URL, avec https://.",
        "Regardez l'aperçu : le QR code se met à jour pendant que vous tapez.",
        "Ouvrez Design pour choisir un style, vos couleurs, la forme des modules, ajouter votre logo et un cadre comme « SCAN ME ».",
        "Téléchargez-le en PNG pour les écrans et les réseaux sociaux, en SVG pour imprimer à toutes les tailles, ou en PDF.",
        "Scannez le fichier téléchargé avec votre téléphone avant de l'imprimer.",
      ],
      usesTitle: "Utilisations courantes",
      uses: [
        "Flyers, affiches et vitrines qui renvoient vers votre site",
        "Emballages qui renvoient vers une notice ou une vidéo",
        "Tables de restaurant qui renvoient vers un menu ou une page de commande",
        "Cartes d'avis qui renvoient vers votre page d'avis Google",
        "Présentations et rapports imprimés qui renvoient vers des ressources",
      ],
      tipsTitle: "Conseils pour un QR code de lien qui scanne toujours",
      tips: [
        "Utilisez une URL courte si possible : moins de caractères donnent un motif plus simple à scanner.",
        "Vérifiez que la page s'affiche bien sur mobile, puisque chaque scan vient d'un téléphone.",
        "Gardez un code foncé sur un fond clair, et un logo petit.",
        "Un code statique ne peut pas être modifié après impression : visez une page dont l'adresse ne changera pas.",
      ],
      faqTitle: "FAQ du QR code de lien",
      faq: [
        { q: "Un QR code de lien expire-t-il ?", a: "Non. L'adresse est enregistrée dans le code lui-même, il fonctionne tant que la page web existe." },
        { q: "Puis-je changer le lien après impression ?", a: "Pas avec un code statique. Si la destination peut changer, pointez vers une page que vous contrôlez, comme votre site ou une carte de visite, et modifiez cette page." },
        { q: "Y a-t-il une limite de scans ?", a: "Non. Les QR codes statiques se scannent sans limite, gratuitement, y compris pour un usage commercial." },
      ],
    },
    wifi: {
      title: "Comment créer un QR code WiFi",
      intro: [
        "Un QR code WiFi permet à vos invités de se connecter à votre réseau en un scan, sans taper un long mot de passe. Le téléphone lit le nom du réseau, le mot de passe et le type de sécurité, puis propose de se connecter.",
        "Il est idéal pour les Airbnb et locations, cafés, restaurants, hôtels, bureaux, salles d'attente et événements. Le code est statique et fonctionne hors ligne : rien ne passe par nos serveurs, et il n'expire jamais.",
      ],
      stepsTitle: "Comment faire un QR code WiFi",
      steps: [
        "Tapez le nom du réseau (SSID) exactement comme il apparaît sur votre téléphone, majuscules et espaces compris.",
        "Saisissez le mot de passe WiFi.",
        "Choisissez la sécurité : WPA/WPA2 pour presque toutes les box récentes, WEP pour les très anciennes, ou aucune pour un réseau ouvert.",
        "Cochez Réseau masqué seulement si votre réseau n'apparaît pas dans la liste des réseaux.",
        "Personnalisez le design, ajoutez un cadre comme « FREE WIFI », puis téléchargez et imprimez.",
      ],
      usesTitle: "Où placer un QR code WiFi",
      uses: [
        "Encadré au mur ou sur un chevalet dans un café ou un restaurant",
        "Dans le livret d'accueil d'un Airbnb ou d'une location de vacances",
        "À la réception d'un hôtel ou sur les cartes de chambre",
        "Dans une salle de réunion ou un hall d'accueil",
        "Sur le frigo à la maison pour les amis et la famille",
      ],
      tipsTitle: "Conseils",
      tips: [
        "Si vous changez le mot de passe WiFi, créez et imprimez un nouveau QR code : l'ancien ne marchera plus.",
        "Testez le code avec un iPhone et un Android avant d'imprimer plusieurs exemplaires.",
        "Pensez à un réseau invité séparé pour que les visiteurs n'utilisent pas votre réseau principal.",
        "Écrivez le nom du réseau sous le code pour les téléphones plus anciens.",
      ],
      faqTitle: "FAQ du QR code WiFi",
      faq: [
        { q: "Faut-il une application pour scanner un QR code WiFi ?", a: "Non. L'appareil photo des iPhone et Android récents lit les QR codes WiFi et propose de rejoindre le réseau." },
        { q: "Mon mot de passe WiFi est-il envoyé à QRVAREN ?", a: "Non. Le QR code est généré dans votre navigateur et le mot de passe n'existe que dans l'image téléchargée." },
        { q: "Le code marche-t-il encore si je change mon mot de passe ?", a: "Non. Le mot de passe fait partie du code, il faut en générer un nouveau après chaque changement." },
      ],
    },
    text: {
      title: "Comment créer un QR code texte",
      intro: [
        "Un QR code texte affiche un message sur l'écran du téléphone dès qu'il est scanné. Ni connexion internet ni site web ne sont nécessaires : le texte est entièrement stocké dans le code.",
        "Utilisez-le pour des instructions courtes, un numéro de série, une citation, un message secret dans un jeu ou une chasse au trésor, ou toute information à lire hors ligne.",
      ],
      stepsTitle: "Comment faire un QR code texte",
      steps: [
        "Tapez ou collez votre message dans le champ texte.",
        "Surveillez l'aperçu et les avertissements : si le texte est trop long, le générateur vous le signale.",
        "Choisissez vos couleurs et votre style dans Design, et ajoutez un cadre comme « READ ME ».",
        "Téléchargez le code en PNG, SVG ou PDF et testez-le avec votre téléphone.",
      ],
      usesTitle: "Utilisations courantes",
      uses: [
        "Chasses au trésor, escape games et activités en classe",
        "Étiquettes de matériel avec numéro de série ou instructions",
        "Petits messages sur des cadeaux et cartes de vœux",
        "Informations qui doivent fonctionner sans internet",
      ],
      tipsTitle: "Conseils",
      tips: [
        "Restez court : quelques lignes se scannent facilement, un texte très long donne un code dense difficile à lire.",
        "Pour un contenu long, mettez-le sur une page web et utilisez plutôt un QR code de lien.",
        "Imprimez plus grand les QR codes texte qui contiennent beaucoup de caractères.",
      ],
      faqTitle: "FAQ du QR code texte",
      faq: [
        { q: "Combien de texte un QR code peut-il contenir ?", a: "En théorie quelques milliers de caractères, mais pour un scan fiable, restez à quelques centaines. Le générateur vous prévient si c'est trop long." },
        { q: "Un QR code texte a-t-il besoin d'internet ?", a: "Non. Le texte est dans le code, il se lit partout, même hors ligne." },
        { q: "Puis-je utiliser des accents et des emojis ?", a: "Oui. Ils sont pris en charge, mais chacun prend plus de place dans le code." },
      ],
    },
    vcard: {
      title: "Comment créer un QR code vCard",
      intro: [
        "Un QR code vCard partage vos coordonnées en un scan. Le téléphone ouvre une fiche contact prête à enregistrer avec votre nom, téléphone, email, entreprise, poste, site web et adresse.",
        "C'est le moyen le plus rapide d'échanger ses coordonnées en rendez-vous, sur un salon ou sur une carte de visite imprimée. Le code est statique, gratuit et n'expire jamais.",
      ],
      stepsTitle: "Comment faire un QR code vCard",
      steps: [
        "Indiquez votre prénom et votre nom.",
        "Ajoutez votre entreprise et votre poste si vous voulez qu'ils apparaissent.",
        "Saisissez votre téléphone avec l'indicatif du pays, votre email et votre site web.",
        "Ajoutez votre adresse si l'on doit pouvoir vous trouver.",
        "Personnalisez le design, ajoutez un cadre « SAVE CONTACT » et téléchargez le code.",
      ],
      usesTitle: "Où l'utiliser",
      uses: [
        "Au dos d'une carte de visite imprimée",
        "Sur un badge lors de conférences et salons",
        "Dans une signature email ou à la fin d'une présentation",
        "Sur un comptoir pour que les clients enregistrent votre numéro",
      ],
      tipsTitle: "Conseils",
      tips: [
        "Ne remplissez que les champs utiles : moins d'informations donnent un code plus simple qui scanne plus vite.",
        "Écrivez les numéros au format international, comme +33 6 12 34 56 78.",
        "Vos coordonnées sont figées dans le code. Si elles changent souvent, préférez une carte de visite digitale hébergée, modifiable à tout moment.",
      ],
      faqTitle: "FAQ du QR code vCard",
      faq: [
        { q: "Que se passe-t-il quand on scanne un QR code vCard ?", a: "Le téléphone affiche une fiche contact avec vos coordonnées et un bouton pour l'ajouter aux contacts." },
        { q: "Puis-je modifier mes coordonnées plus tard ?", a: "Pas dans un code vCard statique. Créez un nouveau code, ou utilisez une carte de visite digitale QRVAREN, modifiable sans réimprimer." },
        { q: "Ça marche sur iPhone et Android ?", a: "Oui. Les deux lisent le format vCard standard directement depuis l'appareil photo." },
      ],
    },
    email: {
      title: "Comment créer un QR code email",
      intro: [
        "Un QR code email ouvre un nouveau message dans l'application mail, avec l'adresse, l'objet et même le texte déjà remplis. Il ne reste qu'à appuyer sur Envoyer.",
        "Il est utile pour le service client, les avis, les demandes de devis, les inscriptions à un événement, ou dès que vous voulez qu'on vous contacte sans taper votre adresse.",
      ],
      stepsTitle: "Comment faire un QR code email",
      steps: [
        "Saisissez l'adresse email qui recevra les messages.",
        "Ajoutez un objet, par exemple « Demande de devis » ou « Avis ».",
        "Écrivez éventuellement le début du message pour guider les gens.",
        "Choisissez un style, ajoutez un cadre « EMAIL US » et téléchargez le code.",
      ],
      usesTitle: "Utilisations courantes",
      uses: [
        "Avis et réclamations en boutique ou au restaurant",
        "Demandes de devis ou d'informations sur flyers et véhicules",
        "Inscriptions à des événements et newsletters",
        "Contact du support sur les emballages",
      ],
      tipsTitle: "Conseils",
      tips: [
        "Utilisez un objet clair pour trier facilement les emails reçus.",
        "Gardez le message pré-rempli court pour garder un code simple.",
        "Écrivez l'adresse email en clair près du code pour ceux qui préfèrent la taper.",
      ],
      faqTitle: "FAQ du QR code email",
      faq: [
        { q: "L'email part-il automatiquement ?", a: "Non. Le scan ouvre un brouillon. La personne le relit et appuie elle-même sur Envoyer." },
        { q: "Quelle application mail s'ouvre ?", a: "L'application mail par défaut du téléphone, comme Mail, Gmail ou Outlook." },
        { q: "Puis-je ajouter plusieurs destinataires ?", a: "Utilisez une adresse par code pour une compatibilité maximale." },
      ],
    },
    sms: {
      title: "Comment créer un QR code SMS",
      intro: [
        "Un QR code SMS ouvre l'application de messages avec un numéro et un message déjà écrits. Il suffit d'appuyer sur Envoyer.",
        "Les entreprises l'utilisent pour les prises de rendez-vous, les offres par SMS, les jeux concours, le support et les avis rapides. Comme tous les codes statiques de QRVAREN, il est gratuit et n'expire jamais.",
      ],
      stepsTitle: "Comment faire un QR code SMS",
      steps: [
        "Saisissez le numéro qui reçoit les messages, avec l'indicatif du pays.",
        "Écrivez le message pré-rempli, par exemple « Je voudrais prendre rendez-vous ».",
        "Personnalisez le design et ajoutez un cadre « TEXT US ».",
        "Téléchargez le code et testez-le avec votre téléphone.",
      ],
      usesTitle: "Utilisations courantes",
      uses: [
        "Demandes de rendez-vous et de rappel",
        "Jeux concours et promotions par SMS",
        "Support client sur emballages et tickets",
        "Avis rapides après une visite",
      ],
      tipsTitle: "Conseils",
      tips: [
        "Utilisez toujours le format international, comme +33 6 12 34 56 78, pour que le numéro marche depuis tous les pays.",
        "Gardez un message court et clair.",
        "Le tarif SMS habituel peut s'appliquer pour l'expéditeur.",
      ],
      faqTitle: "FAQ du QR code SMS",
      faq: [
        { q: "Le message part-il automatiquement ?", a: "Non. L'application de messages s'ouvre avec le texte prêt, et la personne choisit de l'envoyer." },
        { q: "Puis-je utiliser un numéro WhatsApp ?", a: "Pour WhatsApp, utilisez le modèle WhatsApp, qui ouvre directement une conversation dans WhatsApp." },
        { q: "Ça marche sur tous les téléphones ?", a: "Oui. iPhone et Android ouvrent les QR codes SMS dans leur application de messages." },
      ],
    },
    pdf: {
      title: "Comment créer un QR code PDF",
      intro: [
        "Un QR code PDF ouvre un document, comme un menu de restaurant, une brochure, une grille tarifaire, un catalogue ou une notice, dès qu'il est scanné.",
        "Sur QRVAREN, le PDF est hébergé pour vous : il faut donc un compte gratuit (un clic avec Google). Le QR code pointe vers votre fichier, et les scans sont comptés dans votre tableau de bord.",
      ],
      stepsTitle: "Comment faire un QR code PDF",
      steps: [
        "Choisissez PDF et connectez-vous avec Google si ce n'est pas déjà fait.",
        "Importez votre fichier PDF.",
        "Personnalisez le design et ajoutez un cadre comme « SEE THE MENU » ou « VIEW PDF ».",
        "Téléchargez le QR code et imprimez-le sur votre menu, table, flyer ou emballage.",
        "Retrouvez le code et ses scans dans votre tableau de bord, rubrique Mes QR codes.",
      ],
      usesTitle: "Utilisations courantes",
      uses: [
        "Menus de restaurants et de bars",
        "Brochures, catalogues et grilles tarifaires",
        "Notices et fiches de sécurité sur les produits",
        "Programmes d'événements et supports de cours",
      ],
      tipsTitle: "Conseils",
      tips: [
        "Compressez les gros PDF pour qu'ils s'ouvrent vite en 4G.",
        "Concevez le PDF pour un écran de téléphone : grand texte, une seule colonne.",
        "Testez le scan en données mobiles, pas seulement sur votre WiFi.",
      ],
      faqTitle: "FAQ du QR code PDF",
      faq: [
        { q: "Pourquoi faut-il un compte pour un QR code PDF ?", a: "Parce que le fichier doit être stocké en ligne. Le compte est gratuit et vous permet de retrouver vos codes et vos scans." },
        { q: "Faut-il une application pour ouvrir le PDF ?", a: "Non. Le PDF s'ouvre dans le navigateur du téléphone." },
        { q: "Puis-je voir combien de personnes l'ont scanné ?", a: "Oui. Les scans des codes hébergés sont comptés dans votre tableau de bord." },
      ],
    },
    card: {
      title: "Comment créer une carte de visite digitale avec QR code",
      intro: [
        "Une carte de visite digitale est une page mobile pour vous ou votre entreprise, avec logo, photo, téléphone, email, adresse avec carte, horaires, site web, réseaux sociaux et galerie. Les visiteurs ont trois gros boutons : Appeler, Enregistrer le contact et Itinéraire.",
        "Son QR code ne change jamais. Vous modifiez la carte quand vous voulez, et tous ceux qui scannent votre code imprimé voient la nouvelle version, sans rien réimprimer.",
      ],
      stepsTitle: "Comment créer votre carte",
      steps: [
        "Connectez-vous avec Google et ouvrez votre tableau de bord.",
        "Ouvrez l'éditeur de carte et remplissez vos informations : nom, accroche, téléphone, email, adresse, horaires et liens.",
        "Ajoutez votre logo, une photo et quelques images de galerie.",
        "Choisissez une formule mensuelle ou annuelle pour publier la carte à sa propre adresse.",
        "Téléchargez son QR code, ou créez une carte de visite imprimée dans le tableau de bord.",
      ],
      usesTitle: "Pour qui",
      uses: [
        "Indépendants et consultants",
        "Boutiques, restaurants, salons et commerces de proximité",
        "Agents immobiliers et équipes commerciales",
        "Artisans qui travaillent sur chantier",
      ],
      tipsTitle: "Conseils",
      tips: [
        "Écrivez une accroche courte qui dit ce que vous faites en quelques mots.",
        "Ajoutez vos horaires et votre adresse pour que les clients viennent vous voir.",
        "Consultez vos statistiques de scans pour voir quels flyers et lieux marchent le mieux.",
      ],
      faqTitle: "FAQ de la carte de visite digitale",
      faq: [
        { q: "Puis-je modifier ma carte après avoir imprimé le QR code ?", a: "Oui. Le QR code pointe vers l'adresse de votre carte, chaque modification apparaît aussitôt pour tous." },
        { q: "Combien ça coûte ?", a: "Le générateur de QR codes est gratuit. La carte hébergée est un abonnement mensuel ou annuel, résiliable à tout moment. Voir la page tarifs." },
        { q: "Les visiteurs ont-ils besoin d'une application ?", a: "Non. La carte s'ouvre dans le navigateur, et Enregistrer le contact vous ajoute à leurs contacts en un geste." },
      ],
    },
  },
  tutorials: [
    {
      slug: "how-to-create-a-qr-code",
      title: "Comment créer un QR code gratuitement (pas à pas)",
      desc: "Le guide complet pour débutants : créez votre premier QR code avec QRVAREN, du choix du type au téléchargement.",
      minutes: 4,
      cta: { href: "/create", label: "Créer un QR code" },
      sections: [
        {
          h: "Ce qu'il vous faut",
          p: [
            "Juste un navigateur. QRVAREN fonctionne sur ordinateur, tablette ou téléphone, sans application à installer et sans compte pour les codes lien, WiFi, texte, vCard, email et SMS.",
            "Votre QR code est généré directement dans votre navigateur, et les codes téléchargés sont statiques : ils n'expirent jamais et n'ont pas de limite de scans.",
          ],
        },
        {
          h: "Créez votre premier QR code",
          steps: [
            "Ouvrez le générateur avec le bouton Créer en haut de chaque page.",
            "Choisissez un type : URL, WiFi, Texte, vCard, Email, SMS, PDF ou Carte de visite. Vous pouvez aussi partir d'un modèle comme WhatsApp, Spotify ou Google Maps.",
            "Remplissez le contenu. L'aperçu apparaît et se met à jour pendant que vous tapez.",
            "Passez à Design pour changer les couleurs, les formes, ajouter un logo et un cadre (voir le guide de personnalisation).",
            "Cliquez sur Télécharger et choisissez PNG, SVG ou PDF.",
          ],
        },
        {
          h: "Quel type choisir ?",
          list: [
            "URL : envoyer vers un site, une boutique, un formulaire ou une vidéo.",
            "WiFi : connecter vos invités sans taper le mot de passe.",
            "vCard : partager vos coordonnées en un scan.",
            "Email et SMS : ouvrir un message pré-rempli.",
            "Texte : afficher un message qui marche hors ligne.",
            "PDF : ouvrir un menu, une brochure ou un document (compte gratuit nécessaire).",
            "Carte de visite : une page mobile hébergée, modifiable à tout moment.",
          ],
        },
        {
          h: "Avant d'imprimer",
          p: [
            "Scannez toujours le fichier téléchargé avec votre téléphone. Vérifiez qu'il ouvre la bonne page ou action, et qu'il se scanne depuis la distance où les gens se tiendront.",
            "Si le générateur affiche un avertissement sur le contraste, la longueur ou la taille du logo, suivez-le : certains téléphones ne lisent pas ces codes.",
          ],
        },
      ],
    },
    {
      slug: "customize-qr-code-logo-colors",
      title: "Personnaliser son QR code : logo, couleurs et cadre",
      desc: "Adaptez votre QR code à votre marque avec les styles, couleurs, formes, un logo central et un cadre « Scan me », sans casser le scan.",
      minutes: 5,
      cta: { href: "/create", label: "Personnaliser mon QR code" },
      sections: [
        {
          h: "Partez d'un style",
          p: [
            "Dans l'onglet Design, la ligne Styles propose des combinaisons de couleurs prêtes, comme Classic, Midnight, Ocean ou Gold. Choisissez-en une comme point de départ, puis ajustez.",
          ],
        },
        {
          h: "Personnalisez étape par étape",
          steps: [
            "Couleur du code : choisissez la couleur des modules. Les couleurs foncées scannent le mieux.",
            "Fond : choisissez une couleur claire, ou gardez le blanc.",
            "Forme des modules : carrés, points, arrondis ou classy.",
            "Logo central : importez votre logo. Il se place au milieu du code.",
            "Cadre : ajoutez un cadre et un appel à l'action, comme SCAN ME, FREE WIFI ou SEE THE MENU, ou tapez votre propre texte.",
          ],
        },
        {
          h: "Les règles pour un code toujours lisible",
          list: [
            "Gardez un fort contraste : code foncé sur fond clair.",
            "Évitez un code clair sur fond foncé ; certains lecteurs ne lisent pas les codes inversés.",
            "Gardez un petit logo. Le générateur vous prévient s'il couvre trop le code.",
            "Laissez la marge blanche autour du code dans votre mise en page.",
          ],
        },
        {
          h: "Pourquoi un cadre aide",
          p: [
            "On scanne davantage quand on sait ce qu'on va obtenir. Un appel à l'action court comme « SEE THE MENU » ou « SCAN FOR WIFI » donne une raison de sortir son téléphone, et fait ressortir le code sur un flyer chargé.",
          ],
        },
      ],
    },
    {
      slug: "download-and-print-qr-code",
      title: "Télécharger et imprimer un QR code (PNG, SVG ou PDF)",
      desc: "Quel format choisir, à quelle taille imprimer, et comment tester votre QR code pour qu'il scanne à chaque fois.",
      minutes: 4,
      cta: { href: "/create", label: "Créer et télécharger" },
      sections: [
        {
          h: "Choisissez le bon format",
          list: [
            "PNG : une image pour les sites web, réseaux sociaux, emails et documents.",
            "SVG : un fichier vectoriel net à toutes les tailles. Idéal pour les imprimeurs, enseignes et outils comme Canva, Illustrator ou Figma.",
            "PDF : prêt à imprimer, ou à envoyer à un imprimeur.",
          ],
        },
        {
          h: "À quelle taille imprimer",
          p: [
            "Règle simple : le code doit mesurer au moins un dixième de la distance de scan. Pour une carte de visite ou une table, 2 à 3 cm suffisent. Pour une affiche lue à 2 mètres, visez 20 cm.",
            "Les codes avec plus de contenu, comme un long texte ou une vCard complète, sont plus denses et doivent être imprimés plus grand.",
          ],
        },
        {
          h: "Testez avant d'imprimer",
          steps: [
            "Ouvrez le fichier téléchargé sur un autre écran, ou imprimez un seul exemplaire de test.",
            "Scannez-le avec un iPhone et un Android.",
            "Vérifiez qu'il ouvre le bon lien, réseau, contact ou message.",
            "Essayez depuis la distance et l'éclairage du lieu d'utilisation.",
          ],
        },
        {
          h: "Conseils d'impression",
          list: [
            "Préférez un papier mat : les surfaces brillantes reflètent la lumière.",
            "Ne déformez pas le code ; redimensionnez-le proportionnellement.",
            "Gardez la marge blanche autour du code.",
            "Évitez de placer le code sur une courbe ou un pli.",
          ],
        },
      ],
    },
    {
      slug: "create-digital-business-card",
      title: "Créer une carte de visite digitale avec QRVAREN",
      desc: "Configurez votre carte de visite hébergée, ajoutez vos informations, publiez-la et partagez-la avec un QR code qui ne change jamais.",
      minutes: 5,
      cta: { href: "/business-card", label: "Voir la carte de visite" },
      sections: [
        {
          h: "Qu'est-ce qu'une carte de visite digitale ?",
          p: [
            "C'est une page mobile pour vous ou votre entreprise, avec logo, photo, coordonnées, adresse et carte, horaires, réseaux sociaux, galerie et liens. Les visiteurs ont trois boutons : Appeler, Enregistrer le contact et Itinéraire.",
            "Contrairement à un QR code vCard, vous pouvez la modifier à tout moment. Le QR code reste le même, vous n'avez jamais à réimprimer.",
          ],
        },
        {
          h: "Créez votre carte",
          steps: [
            "Cliquez sur Connexion et connectez-vous avec Google. Vous devez avoir 18 ans ou plus.",
            "Dans votre tableau de bord, ouvrez Ma carte de visite et lancez l'éditeur.",
            "Remplissez votre nom, accroche, téléphone, email, adresse, horaires et liens.",
            "Importez votre logo, une photo de profil et des images de galerie.",
            "Choisissez une formule mensuelle ou annuelle pour publier la carte à sa propre adresse.",
          ],
        },
        {
          h: "Partagez-la",
          list: [
            "Téléchargez le QR code de la carte et ajoutez-le à vos flyers, vitrines et emballages.",
            "Créez une carte de visite imprimée dans le tableau de bord, avec le QR code dessus.",
            "Partagez le lien de la carte dans votre signature email et sur les réseaux sociaux.",
          ],
        },
        {
          h: "Suivez vos scans",
          p: [
            "Votre tableau de bord montre combien de fois le QR code de votre carte a été scanné sur les 30 derniers jours, pour voir ce qui marche. Les scans sont comptés sans revendre les données de personne.",
          ],
        },
      ],
    },
    {
      slug: "design-printed-business-card",
      title: "Créer et imprimer une carte de visite avec QR code",
      desc: "Utilisez l'éditeur de cartes QRVAREN pour créer une carte de visite papier avec votre QR code, puis téléchargez un PDF prêt à imprimer.",
      minutes: 4,
      cta: { href: "/login", label: "Ouvrir mon tableau de bord" },
      sections: [
        {
          h: "Ouvrez l'éditeur",
          p: [
            "L'éditeur de carte imprimée se trouve dans votre tableau de bord, rubrique Carte imprimée. Connectez-vous avec Google pour y accéder.",
          ],
        },
        {
          h: "Créez votre carte",
          steps: [
            "Choisissez un modèle, comme Classic, Bold, Minimal ou Elegant. Il remplit les deux faces avec vos informations.",
            "Modifiez vos informations dans le panneau latéral, ou cliquez directement sur un texte de la carte.",
            "Ajoutez du texte, des images, votre logo, des formes et un QR code. Glissez pour déplacer, utilisez la poignée ronde pour redimensionner.",
            "Choisissez ce qu'ouvre le QR code : votre carte en ligne, n'importe quel lien, ou votre propre image de QR code.",
            "Gardez tout à l'intérieur de la ligne pointillée pour que rien ne soit coupé.",
          ],
        },
        {
          h: "Téléchargez et imprimez",
          list: [
            "PDF pour l'imprimeur : recto et verso avec fond perdu, en 300 dpi, prêt pour un imprimeur.",
            "Impression maison : une planche de 10 cartes avec traits de coupe. Imprimez en recto verso, retournement sur le bord long.",
            "Choisissez le format de carte US ou européen avant l'export.",
          ],
        },
        {
          h: "Taille du QR code sur une carte",
          p: [
            "Gardez le QR code à au moins 2 cm de large. L'éditeur vous prévient quand il est trop petit pour certains téléphones.",
          ],
        },
      ],
    },
  ],
};

export default fr;
