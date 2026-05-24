import "dotenv/config"
import bcrypt from "bcryptjs"
import { prisma } from "../lib/prisma"

type Letter = "A" | "B" | "C" | "D" | "E"

type SeedQuestion = {
  order: number
  points: number
  text: string
  correct: Letter[]
  options: Record<Letter, string>
}

type SeedQcm = {
  id: string
  title: string
  description: string
  specialityName: string
  classLevelName: string
  year: number
  questions: SeedQuestion[]
}

const CURRENT_SPECIALITIES = ["Neurology", "Cardiology", "Anatomy", "Biophysics", "Psychology"]

const EXAM_SPECIALITIES = [
  "Sciences médicales intégrées",
  "Neuroanatomie",
  "Histologie",
  "Neurophysiologie",
  "Neurosciences motrices et sensitives",
]

const DEFAULT_CLASS_LEVELS = ["First Year", "Second Year", "Third Year"]
const EXAM_CLASS_LEVEL = "Epreuve TH 2024"

function q(
  order: number,
  points: number,
  text: string,
  correct: Letter[],
  options: Record<Letter, string>
): SeedQuestion {
  return { order, points, text, correct, options }
}

const examQuestions: SeedQuestion[] = [
  q(1, 2, "Le lobe de l’insula :", ["B", "C"], {
    A: "Est situé au fond de la scissure centrale",
    B: "Est visualisable après ablation des régions operculaires",
    C: "Est formé de 5 circonvolutions",
    D: "Contient l’aire visuelle primaire",
    E: "Est visible sur une vue médiale du cerveau",
  }),
  q(2, 2, "Le lobe occipital :", ["B", "C"], {
    A: "Est limité en avant par le sillon post-central",
    B: "Est composé de six circonvolutions",
    C: "Représente le centre de la fonction visuelle",
    D: "La scissure calcarine est localisée au niveau de sa face externe",
    E: "Est séparé du lobe temporal par le sillon occipital transverse",
  }),
  q(3, 2, "Le nerf cochléo-vestibulaire (VIII) :", ["B", "D"], {
    A: "Fait partie des nerfs mixtes",
    B: "Est accompagné par le VII, le VII bis et l’artère auditive interne (ou labyrinthique) dans son trajet cisternal",
    C: "Son atteinte se traduit par une surdité isolée",
    D: "Chemine dans la citerne ponto-cérébelleuse pour atteindre le méat acoustique interne",
    E: "Se situe en dedans du nerf facial à leur émergence du tronc cérébral",
  }),
  q(4, 2, "Le nerf facial (VII) :", ["C", "D"], {
    A: "Est un nerf moteur pur",
    B: "Son atteinte est responsable d’une paralysie du territoire inférieur de l’hémiface homolatérale",
    C: "Émerge du sillon ponto-bulbaire",
    D: "Dans sa portion extra-crânienne, il pénètre dans la glande parotide avant de se diviser en branches terminales",
    E: "Commande les muscles de la mastication",
  }),
  q(5, 2, "Concernant le tractus cortico-nucléaire :", ["A", "C"], {
    A: "Naît de la face latérale du gyrus précentral au niveau de sa partie inférieure",
    B: "Lors de son trajet, il fait relais avec les noyaux intermédiaires du thalamus",
    C: "Dans le tronc cérébral, il chemine en dedans de la voie corticospinale",
    D: "Se projette bilatéralement sur les noyaux inférieurs du VII",
    E: "Croise la ligne médiane au niveau de la jonction bulbo-médullaire",
  }),
  q(6, 3, "Concernant la voie lemniscale :", ["A", "B", "E"], {
    A: "Est une voie très rapide à trois neurones",
    B: "Elle véhicule la sensibilité tactile épicritique et proprioceptive consciente",
    C: "Les fibres nerveuses sont de petits calibres et faiblement myélinisées",
    D: "L’axone du premier neurone passe par le cordon postérieur après un relais dans la corne postérieure de la moelle",
    E: "Les fibres sacrales et lombales sont en position médiale par apport aux fibres thoraciques et cervicales",
  }),
  q(7, 2, "Parmi les artères suivantes, quelles sont les branches terminales de l’artère carotide interne :", ["A"], {
    A: "L’artère cérébrale moyenne",
    B: "L’artère ophtalmique",
    C: "L’artère cérébrale postérieure",
    D: "L’artère communicante antérieure",
    E: "L’artère choroïdienne antérieure",
  }),
  q(8, 1, "Le tronc basilaire :", ["D"], {
    A: "Fournit les artères cérébelleuses antéro-inferieures et postéro-inferieures",
    B: "Fournit l’artère spinale antérieure",
    C: "Nait de la fusion des deux artères cérébrales postérieures",
    D: "Chemine à la face antérieure de la protubérance",
    E: "Forme avec l’artère cérébelleuse supérieure la pince artérielle du III",
  }),
  q(9, 4, "Concernant les neurones :", ["A", "C", "D"], {
    A: "Ils possèdent peu de réserve d’énergie et ont besoin de glucose et d’oxygène.",
    B: "Ils sont capables de se diviser.",
    C: "Leur cytosquelette est très développé.",
    D: "L’axoplasme est le siège d’une intense circulation moléculaire dans les 2 sens : transport antérograde et transport rétrograde.",
    E: "La cellule pyramidale du cortex cérébral est un neurone pseudo-unipolaire.",
  }),
  q(10, 4, "Concernant les astrocytes :", ["B", "D", "E"], {
    A: "Ils représentent les cellules les moins fréquentes du système nerveux central (SNC)",
    B: "Ils renferment l’essentiel du glycogène du SNC.",
    C: "Ils sont très mobiles.",
    D: "Chaque astrocyte forme avec un neurone et un vaisseau une unité angio-glio-neurale.",
    E: "Au cours des dégénérescences, ils prolifèrent et envahissent les espaces laissés libres après la mort des neurones.",
  }),
  q(11, 4, "Concernant la moelle épinière :", ["B", "C", "E"], {
    A: "Elle s’étend de la 1ère vertèbre cervicale jusqu’à la 4ème vertèbre lombaire.",
    B: "Elle est composée de substance grise centrale et de substance blanche périphérique.",
    C: "Les dendrites des neurones des cornes dorsales font synapses avec les axones des cellules du ganglion rachidien.",
    D: "Les axones des motoneurones alpha innervent les fuseaux musculaires.",
    E: "Certains neurones intercalaires permettent les relais entre les différents étages de la moelle du même côté ou du côté opposé.",
  }),
  q(12, 4, "Concernant la gaine de myéline :", ["A", "C", "D", "E"], {
    A: "La myéline est essentiellement composée de phospholipides.",
    B: "Les cellules de Schwann sont responsables de la myélinisation des neurites dans le système nerveux central.",
    C: "Un oligodendrocyte peut contribuer à la myélinisation de plusieurs axones.",
    D: "Les nœuds de Ranvier interviennent dans la conduction saltatoire de l’influx nerveux.",
    E: "Au cours de la dégénérescence wallérienne, la gaine de myéline tend à disparaitre au niveau de partie distale de l’axone sectionné.",
  }),
  q(13, 4, "Concernant la cornée :", ["B", "C", "E"], {
    A: "Son stroma représente 10 % de l’épaisseur totale cornéenne.",
    B: "Son stroma est caractérisé par l’orientation particulière des fibres de collagène, contribuant à la transparence cornéenne.",
    C: "Son épithélium antérieur se renouvelle rapidement et peut cicatriser en cas de lésion.",
    D: "Elle est richement vascularisée.",
    E: "Une déformation de sa sphéricité entraine un astigmatisme.",
  }),
  q(14, 4, "Concernant le cristallin :", ["A", "C", "D", "E"], {
    A: "C’est une lentille biconvexe d’environ 1 cm de diamètre.",
    B: "Il est vascularisé.",
    C: "Il est humidifié par l’humeur aqueuse.",
    D: "Avec le vieillissement, sa déformabilité diminue : c’est la presbytie.",
    E: "Au cours du développement embryo-fœtal, il peut rester opaque, à l’origine de la cataracte congénitale.",
  }),
  q(15, 4, "Concernant les récepteurs sensoriels épithéliaux de l’oreille interne :", ["A", "B", "D", "E"], {
    A: "Les cellules sensorielles présentant à leur pôle apical un système très organisé de cils.",
    B: "Les cellules sensorielles sont entourées de cellules de soutien.",
    C: "Les macules de l’utricule et du saccule sont histologiquement différentes.",
    D: "Au niveau des crêtes ampullaires, la matrice extracellulaire gélatineuse est en forme de dôme appelée cupule.",
    E: "L’organe de Corti de la cochlée permet de percevoir les vibrations sonores.",
  }),
  q(16, 4, "Soit le schéma ci-dessous illustrant la muqueuse olfactive :", ["A", "B", "D"], {
    A: "Elle est localisée au niveau du toit des fosses nasales.",
    B: "Les cellules 2 continuent de proliférer chez l’adulte grâce aux cellules 1.",
    C: "Les structures 3 correspondent à des microvillosités présentant des récepteurs aux molécules odorantes.",
    D: "Les structures 4 traversent la lame criblée de l’éthmoïde pour établir des connexions synaptiques avec des neurones du bulbe olfactif.",
    E: "Les structures 5, situées au niveau du chorion, correspondent à des glandes à sécrétion muqueuse.",
  }),
  q(17, 3, "Au niveau d’un neurone :", ["A", "B", "C", "D"], {
    A: "Le potentiel de repos est maintenu grâce à la pompe Na + /K + ATPase",
    B: "Le potentiel d’action (PA) est réversible",
    C: "L’amplitude de la dépolarisation atteint 100 mV",
    D: "La durée du PA correspond à la période réfractaire absolue",
    E: "Les PA sont sommables si leur fréquence est très élevée",
  }),
  q(18, 3, "Au niveau des neurones, la sommation :", ["A", "D", "E"], {
    A: "Est appelée spatiale quand plusieurs neurones pré-synaptiques sont stimulés en même temps",
    B: "Est un phénomène commun aux synapses chimiques et électriques",
    C: "Augmente l’amplitude du PA dans l’élément post-synaptique",
    D: "Augmente l’amplitude des potentiels post-synaptiques (PPS)",
    E: "Ne permet pas toujours à l’élément post-synaptique d’atteindre le seuil de déclenchement du PA",
  }),
  q(19, 3, "Au niveau d’une jonction neuro-musculaire :", ["C"], {
    A: "L’élément présynaptique est une fibre nerveuse type Ia",
    B: "Les canaux sodiques voltage-dépendants sont indispensables pour l’exocytose du neurotransmetteur",
    C: "La quantité de neurotransmetteur libérée dépend de la fréquence des PA présynaptiques",
    D: "Les récepteurs post-synaptiques peuvent être métabotropiques",
    E: "La membrane post-synaptique ne contient pas de canaux voltage-dépendants",
  }),
  q(20, 3, "La jonction neuromusculaire est une synapse efficace car :", ["D", "E"], {
    A: "La sommation spatiale permet d’augmenter l’amplitude du potentiel de plaque motrice (PPM)",
    B: "Le nombre de récepteurs post-synaptiques excitateurs est plus élevé que les inhibiteurs",
    C: "La quantité d’acétylcholine libérée est plus importante que celle du GABA",
    D: "Les invaginations de la membrane post-synaptique augmentent le nombre de récepteurs",
    E: "Le PPM est toujours suffisant pour déclencher un PA musculaire",
  }),
  q(21, 3, "La spinalisation :", ["A", "B", "D", "E"], {
    A: "Est une section sous bulbaire",
    B: "Est la meilleure préparation animale pour l’étude des réflexes médullaires",
    C: "Entraine une hypertonie des extenseurs des membres inférieurs",
    D: "Entraine une aréflexie transitoire",
    E: "Entraine des troubles végétatifs",
  }),
  q(22, 3, "Les fuseaux neuromusculaires :", ["C", "E"], {
    A: "Sont annexés à des fibres nerveuses de type Ia et Ib",
    B: "Sont des récepteurs extrinsèques",
    C: "À chaines, sont annexés à des fibres nerveuses de type II",
    D: "Ont une partie centrale innervée par les motoneurones g",
    E: "Sont indispensables au maintien du tonus musculaire du corps immobile et en mouvement",
  }),
  q(23, 3, "A l’état physiologique, les fibres de type Ia :", ["A", "C"], {
    A: "Ont une sensibilité prédominante à la vitesse d’étirement du muscle",
    B: "Ont une sensibilité prédominante à la vitesse d’augmentation de la force musculaire",
    C: "Diminuent leur fréquence de décharge lors du raccourcissement du muscle",
    D: "Sont silencieuses quand le muscle est au repos",
    E: "Sont impliquées dans la sensibilité extralemniscale",
  }),
  q(24, 3, "L’innervation réciproque :", ["D"], {
    A: "Implique les cellules de Renshaw",
    B: "Est observée dans tous les réflexes médullaires",
    C: "Se manifeste par un effet similaire sur le muscle agoniste",
    D: "Se manifeste par un effet opposé sur le muscle antagoniste",
    E: "Met en jeu des neurones provenant des structures supra-médullaires",
  }),
  q(25, 3, "La rigidité de décérébration est secondaire à la levée de l’inhibition sur :", ["D"], {
    A: "Les noyaux gris de la base",
    B: "Les noyaux rouges",
    C: "Le lobe flocculonodulaire du cervelet",
    D: "La formation réticulée facilitatrice descendante",
    E: "La formation réticulée inhibitrice bulbaire",
  }),
  q(26, 3, "Les cellules de Renshaw sont directement stimulées par :", ["B"], {
    A: "Les motoneurones g",
    B: "Les motoneurones a",
    C: "Les fibres Ib",
    D: "Les fibres de type IV",
    E: "Les interneurones médullaires",
  }),
  q(27, 3, "Le Réflexe Vestibulo-Oculo-Moteur (RVOM) :", ["B", "C"], {
    A: "Est déclenché lorsque notre corps est soumis à des accélérations linéaires",
    B: "N’implique pas tous les noyaux vestibulaires",
    C: "Implique les noyaux oculomoteurs du III et du VI",
    D: "Peut être déclenché par l’injection d’eau à 37° dans l’oreille interne",
    E: "A une première composante rapide et une deuxième lente",
  }),
  q(28, 3, "Les canaux semi-circulaires (csc) s’organisent comme suit :", ["C", "D"], {
    A: "Les csc d’un côté se trouvent tous dans le même plan de l’espace",
    B: "Le csc antérieur d’un côté est dans le même plan de l’espace que son homologue controlatéral",
    C: "Le csc postérieur d’un côté est dans le même plan de l’espace que l’antérieur controlatéral",
    D: "Les csc horizontaux travaillent en opposition",
    E: "Tous les csc sont sollicités en cas de rotation de la tête",
  }),
  q(29, 3, "Le mouvement de l’endolymphe dans un canal semi-circulaire horizontal :", ["B", "C", "D", "E"], {
    A: "A lieu en cas de changement des forces de gravité",
    B: "A lieu en cas de rotation de la tête, légèrement inclinée vers l’avant de 30°",
    C: "Ascendant, rapproche les kinocils de l’utricule",
    D: "Ascendant, ramène la fréquence de décharge des fibres sensitives à une valeur > 100 Hz",
    E: "Descendant, entraîne une inhibition des noyaux vestibulaires supérieurs et médians",
  }),
  q(30, 3, "La macule sacculaire se caractérise par la sensibilité de ses cellules neurosensorielles aux :", ["B", "C", "E"], {
    A: "Mouvements de l’endolymphe",
    B: "Mouvements des otolithes",
    C: "Variations des forces de gravité",
    D: "Accélérations angulaires",
    E: "Accélérations linéaires verticales",
  }),
  q(31, 3, "Les Noyaux Vestibulaires Médians droits :", ["A", "D", "E"], {
    A: "Contrôlent les noyaux moteurs oculaires du VI gauche",
    B: "Sont connectés aux canaux semi-circulaires gauches",
    C: "Se projettent sur les MTN a et ϒ de la musculature distale",
    D: "Sont stimulés au début de la rotation de la tête de la gauche vers la droite",
    E: "Sont inhibés quand on injecte de l’eau à 30° dans l’oreille interne droite",
  }),
  q(32, 3, "Au niveau du cervelet, la couche moléculaire contient :", ["A", "C"], {
    A: "Les axones des cellules olivaires",
    B: "Les corps cellulaires des cellules de Purkinje",
    C: "Les fibres parallèles",
    D: "Les cellules de Golgi",
    E: "Les glomérules cérébelleux",
  }),
  q(33, 3, "Les cellules de Purkinje :", ["D"], {
    A: "Forment les fibres parallèles à partir de leurs dendrites",
    B: "Sont des cellules excitatrices qui amplifient les signaux provenant des noyaux cérébelleux",
    C: "Reçoivent des signaux d’entrée principalement des fibres moussues",
    D: "Inhibent les noyaux cérébelleux profonds",
    E: "Sont les principales cellules gliales du cervelet",
  }),
  q(34, 3, "Le cervelet reçoit des informations nerveuses provenant essentiellement :", ["C"], {
    A: "Du cortex cérébral, du tronc cérébral et des ganglions de la base",
    B: "Du cortex cérébral, des noyaux gris centraux et de l’hypothalamus",
    C: "Du cortex cérébral, des noyaux vestibulaires et de la moelle épinière",
    D: "Du tronc cérébral, des noyaux vestibulaires et des ganglions de la base",
    E: "Du cortex cérébral, de l’hippocampe et de la moelle épinière",
  }),
  q(35, 3, "Les lésions du cervelet peuvent entrainer :", ["B"], {
    A: "Des troubles de la mémoire à court terme et des hallucinations",
    B: "Une ataxie, des tremblements intentionnels et une dysarthrie",
    C: "Des déficits sensorimoteurs",
    D: "Des crises épileptiques et des troubles de l’humeur",
    E: "Des troubles visuels sévères",
  }),
  q(36, 3, "Parmi les neuromédiateurs directement impliqués dans les circuits des noyaux gris centraux on peut citer :", ["A", "B", "D"], {
    A: "Le glutamate",
    B: "La dopamine",
    C: "L’histamine",
    D: "Le GABA",
    E: "La noradrénaline",
  }),
  q(37, 3, "La boucle cortico-striato-thalamo-corticale indirecte se caractérise par :", ["C", "E"], {
    A: "La mise en jeu des neurones striataux à Glutamate",
    B: "L’inhibition du Globus Pallidus interne ou médian (GPi ou GPm) / Substance Noire réticulaire (SNr)",
    C: "Le renforcement de l’inhibition du thalamus",
    D: "Sa stimulation par la voie nigro-striatale dopaminergique",
    E: "Son effet dysfacilitateur du mouvement",
  }),
  q(38, 3, "Les neurones dopaminergiques de la Substance Noire compacte (SNc) :", ["B", "E"], {
    A: "Facilite la voie indirecte en stimulant le D1-striatum",
    B: "Renforcent les influx excitateurs thalamo-corticaux",
    C: "N’ont pas d’effet sur la boucle cortico-striato-thalamo-corticale directe",
    D: "Sont inhibés par les neurones glutamatergiques en provenance du cortex moteur",
    E: "Sont dégénérés au cours de la maladie de Parkinson",
  }),
  q(39, 3, "Le cortex moteur primaire :", ["D", "E"], {
    A: "Correspond à l’aire 6 de Brodmann",
    B: "Est impliqué dans la reconnaissance des objets et des visages",
    C: "Est composé de neurones qui permettent l’apprentissage par imitation",
    D: "Reçoit des afférences provenant du cortex somesthésique",
    E: "Correspond au centre de l’exécution motrice",
  }),
  q(40, 3, "Les lésions du cortex moteur :", ["C", "D"], {
    A: "N’affectent pas les muscles du tronc et des membres supérieurs",
    B: "Peuvent entrainer des troubles de la coordination des mouvements",
    C: "Peuvent entrainer une parésie du côté opposé à la lésion",
    D: "Peuvent entrainer des troubles de la parole",
    E: "Peuvent entrainer des troubles de la mémoire",
  }),
  q(41, 3, "La voie pyramidale cortico-spinale :", ["B", "E"], {
    A: "Part du cortex somesthésique, traverse le thalamus et se termine au niveau de la protubérance",
    B: "Part du cortex moteur primaire, traverse le bulbe rachidien et se termine au niveau de la moelle épinière",
    C: "Part du cervelet, passe par les noyaux vestibulaires et se termine au niveau du cortex moteur",
    D: "Contrôle les fonctions autonomes telles que la digestion et la respiration",
    E: "Contrôle les mouvements volontaires fins des membres",
  }),
  q(42, 3, "Les thermorécepteurs au chaud :", ["B", "C", "D"], {
    A: "Sont à adaptation rapide",
    B: "Génèrent une réponse mixte : dynamique et statique",
    C: "Sont annexés à des fibres amyéliniques",
    D: "Sont impliqués dans la sensibilité extralemniscale",
    E: "Sont détruits chez les patients ayant une syringomyélie",
  }),
  q(43, 3, "La voie lemniscale :", ["C", "D", "E"], {
    A: "Passe par les noyaux thalamiques homolatéraux",
    B: "Véhicule la sensibilité tactile grossière",
    C: "Se caractérise par l’organisation somatotopique précise de ses fibres et de ses relais",
    D: "Se caractérise par la vitesse de conduction élevée de ses fibres",
    E: "Est préservée chez les patients ayant une syringomyélie",
  }),
  q(44, 3, "L’hémi-section droite de la moelle épinière ou Syndrome de Brown-Séquard se manifeste par une perte :", ["B", "C"], {
    A: "Du tonus musculaire du côté gauche",
    B: "De la sensibilité tactile fine du côté droit",
    C: "De la sensibilité thermo-algique du côté gauche",
    D: "De la sensibilité thermo-algique du côté droit et gauche",
    E: "De l’équilibre",
  }),
  q(45, 3, "Choisir la ou les proposition(s) justes(s) : sujet de 25 ans, A = 10 dioptries, astigmatisme régulier hypéropique simple conforme à la règle de 2 dioptries.", ["A", "C", "E"], {
    A: "La focale horizontale est sur la rétine.",
    B: "La focale verticale est sur la rétine.",
    C: "Il verra un objet ponctuel situé à l'infini sous forme d'un petit segment de droite horizontale net.",
    D: "Il verra un objet ponctuel situé à l'infini sous forme d'un petit segment de droite vertical net.",
    E: "On le corrige avec une lentille cylindrique à axe vertical, convergente de 2 dioptries.",
  }),
  q(46, 4, "Choisir la (les) proposition(s) juste(s) : les qualités physiologiques d'un son pur sont :", ["A", "B"], {
    A: "La hauteur ou tonie",
    B: "L'intensité sonore ou sonie",
    C: "La fréquence fondamentale",
    D: "Le timbre.",
    E: "La puissance acoustique",
  }),
  q(47, 3, "Choisir la ou les proposition(s) justes(s) :", ["A", "B", "D"], {
    A: "Le déplacement du liquide péri lymphatique est fonction de la fréquence.",
    B: "Pour des vibrations de fréquences inférieures à 20 Hz la colonne de liquide des deux rampes vestibulaire et tympanique se déplace en bloc.",
    C: "Pour des vibrations de fréquences inférieures à 20 Hz l'impédance mécanique de l'hélicotréma augmente.",
    D: "Pour des vibrations de fréquences entre 20 et 20.000 Hz, les mouvements des liquides se font en déformant les membranes du canal cochléaire.",
    E: "La membrane basilaire présente une élasticité uniforme.",
  }),
  q(48, 4, "Choisir la (les) proposition(s) juste(s) :", ["B", "E"], {
    A: "Le potentiel microphonique, (p. m) n'est pas simultané au son qui le produit.",
    B: "L'amplitude du p. m varie avec l'intensité du son stimulant jusqu'à un niveau acoustique de 80 dB.",
    C: "Le p. m a une période réfractaire.",
    D: "Le potentiel d'action élémentaire reproduit fidèlement la forme de l'onde sonore.",
    E: "Le potentiel de sommation survient avec un seuil et se superpose au p. m",
  }),
  q(49, 4, "Préciser la ou les propositions correctes :", ["A", "D"], {
    A: "Ce sont les bâtonnets qui sont stimulés lors de la vision nocturne et ils nous permettent de distinguer les objets en niveau de gris.",
    B: "Le principe de la synthèse additive des couleurs repose sur l’addition de toutes les couleurs spectrales.",
    C: "Le tritanope est la personne incapable de percevoir les longueurs d’onde verte de la lumière.",
    D: "Pour dépister un type de dyschromatopsie, on peut utiliser une série de tests visuels spécifiques tels que le test d’Ishiara.",
    E: "Les cônes assurent la perception des changements d’intensité lumineuse.",
  }),
  q(50, 4, "Préciser la ou les propositions correctes :", ["A", "C"], {
    A: "La photométrie est la science qui étudie le rayonnement lumineux du point de vue de la luminosité perçue par l’œil humain, plutôt que l’énergie totale du rayonnement.",
    B: "Les bâtonnets sont beaucoup moins sensibles que les cônes mais beaucoup plus rapides à s’adapter.",
    C: "L’effet Purkinje s’explique par le fait que le maximum de sensibilité se décale vers le bleu à mesure que la luminance diminue.",
    D: "Les bâtonnets sont des photorécepteurs particuliers de la rétine qui sont actifs uniquement lors de fort éclairement.",
    E: "La couleur complémentaire est une autre couleur, qui, mélangée avec la première, donne un résultat trichromatique.",
  }),
  q(51, 4, "En utilisant le triangle de Maxwell, indiquer les tonalités des couleurs complémentaires :", ["C", "E"], {
    A: "La tonalité de la complémentaire du jaune est bleue-verte.",
    B: "La tonalité de la complémentaire du vert est rouge.",
    C: "La tonalité de la complémentaire du jaune est bleue.",
    D: "La tonalité de la complémentaire du rouge est verte.",
    E: "La tonalité de la complémentaire du vert est pourpre.",
  }),
  q(52, 2, "Dans un cas normal, le développement de la cochlée :", ["D"], {
    A: "Débute à la naissance",
    B: "Est achevé à la naissance",
    C: "Débute à 6 ans",
    D: "Est achevé à 4 mois ½ de vie fœtale",
    E: "Est achevé à 6 mois de vie fœtale",
  }),
  q(53, 2, "Dans un cas normal, le développement des centres auditifs cérébraux :", ["B"], {
    A: "Est indépendant du développement de la cochlée",
    B: "Est maximal après celui de la cochlée",
    C: "Est maximal avant celui de la cochlée",
    D: "Est achevé à la naissance",
    E: "Est minimal avant celui de la cochlée",
  }),
  q(54, 2, "Comment la plasticité cérébrale est-elle liée au développement cochléaire ?", ["D", "E"], {
    A: "La plasticité cérébrale n'est pas affectée par le développement cochléaire.",
    B: "Le développement cochléaire inhibe la plasticité cérébrale.",
    C: "La plasticité cérébrale est maximale lorsque le développement cochléaire est complet.",
    D: "La plasticité cérébrale est maximale pendant le développement cochléaire.",
    E: "La plasticité cérébrale diminue lorsque le développement cochléaire progresse.",
  }),
  q(55, 4, "Selon Piaget, l’acquisition de la fonction symbolique s’acquiert au cours :", ["C"], {
    A: "Du sous-stade 1 de la période sensori-motrice",
    B: "Du sous-stade 2 de la période sensori-motrice",
    C: "De la période pré-opératoire",
    D: "De la période opératoire (opérations concrètes)",
    E: "De la période des opérations formelles",
  }),
  q(56, 4, "Durant le stade sensori-moteur du développement cognitif selon Piaget :", ["A", "D"], {
    A: "L’intelligence est liée à l’action",
    B: "Jusqu’à 8 mois, les réflexes archaïques dominent le mode d’être de l’enfant",
    C: "La pensée est hypothético-déductive",
    D: "Se fait l’acquisition de la permanence de l’objet",
    E: "S’acquièrent les notions de conservation",
  }),
  q(57, 4, "Concernant la période pré-opératoire du développement cognitif selon Piaget :", ["C", "D"], {
    A: "Elle s’étend de la naissance à la 2ème année",
    B: "Le raisonnement est abstrait",
    C: "Se caractérise par l’acquisition du jeu de faire semblant",
    D: "Durant laquelle, l’enfant a accès à la fonction symbolique",
    E: "Durant laquelle, l’enfant a accès à la réversibilité logique",
  }),
  q(58, 4, "Concernant le développement normal du langage, l’acquisition des premiers mots se fait :", ["B"], {
    A: "Au stade pré-linguistique",
    B: "Vers la fin de la première année",
    C: "Vers 18 mois",
    D: "Vers 24 mois",
    E: "A partir de 3 ans",
  }),
  q(59, 4, "Concernant le développement normal du langage :", ["C", "D"], {
    A: "A l’âge de 9 mois l’enfant commence à babiller",
    B: "A l’âge de 3 ans, l’enfant commence à comprendre les ordres simples",
    C: "Vers la fin de la première année, il y a l’émission des premiers mots",
    D: "Une altération de la prononciation est observée chez les enfants de 2 ans.",
    E: "L’acquisition du « je » se fait à 18 mois",
  }),
]

const splitQcms: Omit<SeedQcm, "questions" | "year" | "classLevelName">[] = [
  {
    id: "qcm-th-2024-neuroanatomie",
    title: "TH Juin 2024 - Neuroanatomie",
    description: "Questions extraites sur les lobes cérébraux, nerfs crâniens, voies sensitives et vascularisation.",
    specialityName: "Neuroanatomie",
  },
  {
    id: "qcm-th-2024-histologie-organes-sens",
    title: "TH Juin 2024 - Histologie et organes des sens",
    description: "Questions extraites sur neurones, glie, moelle, myéline, cornée, cristallin, oreille interne et olfaction.",
    specialityName: "Histologie",
  },
  {
    id: "qcm-th-2024-neurophysiologie",
    title: "TH Juin 2024 - Neurophysiologie",
    description: "Questions extraites sur potentiel d’action, synapses, jonction neuromusculaire, réflexes et vestibulaire.",
    specialityName: "Neurophysiologie",
  },
  {
    id: "qcm-th-2024-neurosciences-motrices",
    title: "TH Juin 2024 - Neurosciences motrices et sensitives",
    description: "Questions extraites sur cervelet, noyaux gris centraux, cortex moteur, voies sensitives et Brown-Séquard.",
    specialityName: "Neurosciences motrices et sensitives",
  },
  {
    id: "qcm-th-2024-biophysique-sensorielle",
    title: "TH Juin 2024 - Biophysique sensorielle",
    description: "Questions extraites sur optique, audition, cochlée, vision des couleurs et photométrie.",
    specialityName: "Biophysics",
  },
  {
    id: "qcm-th-2024-developpement-psychologie",
    title: "TH Juin 2024 - Développement auditif et psychologie",
    description: "Questions extraites sur développement cochléaire, plasticité cérébrale, Piaget et langage.",
    specialityName: "Psychology",
  },
]

const splitRanges = [
  [1, 8],
  [9, 16],
  [17, 31],
  [32, 44],
  [45, 51],
  [52, 59],
] as const

function questionsInRange(start: number, end: number) {
  return examQuestions.filter((question) => question.order >= start && question.order <= end)
}

async function ensureSpeciality(name: string) {
  return prisma.speciality.upsert({
    where: { name },
    update: {},
    create: { name },
  })
}

async function ensureClassLevel(name: string, specialityId: string) {
  const existing = await prisma.classLevel.findFirst({
    where: { name, specialityId },
    orderBy: { createdAt: "asc" },
  })

  if (existing) return existing

  return prisma.classLevel.create({ data: { name, specialityId } })
}

async function refreshSeededQcm(qcm: SeedQcm, professorId: string, specialityId: string, classLevelId: string) {
  await prisma.qcmAttempt.deleteMany({ where: { qcmId: qcm.id } })
  await prisma.qcm.deleteMany({ where: { id: qcm.id } })

  return prisma.qcm.create({
    data: {
      id: qcm.id,
      title: qcm.title,
      description: qcm.description,
      year: qcm.year,
      specialityId,
      classLevelId,
      professorId,
      questions: {
        create: qcm.questions.map((question) => ({
          questionText: question.text,
          type: question.correct.length === 1 ? "SINGLE_CHOICE" : "MULTIPLE_CHOICE",
          points: question.points,
          order: question.order,
          options: {
            create: (Object.entries(question.options) as Array<[Letter, string]>).map(([letter, text], index) => ({
              text: `${letter}- ${text}`,
              isCorrect: question.correct.includes(letter),
              order: index + 1,
            })),
          },
        })),
      },
    },
  })
}

async function main() {
  console.log("Seeding database...")

  const specialityNames = [...new Set([...CURRENT_SPECIALITIES, ...EXAM_SPECIALITIES])]
  const specialities = await Promise.all(specialityNames.map(ensureSpeciality))
  const specialityByName = new Map(specialities.map((speciality) => [speciality.name, speciality]))

  for (const specialityName of CURRENT_SPECIALITIES) {
    const speciality = specialityByName.get(specialityName)
    if (!speciality) continue
    await Promise.all(DEFAULT_CLASS_LEVELS.map((level) => ensureClassLevel(level, speciality.id)))
  }

  for (const specialityName of specialityNames) {
    const speciality = specialityByName.get(specialityName)
    if (!speciality) continue
    await ensureClassLevel(EXAM_CLASS_LEVEL, speciality.id)
  }

  const neurology = specialityByName.get("Neurology")
  if (!neurology) throw new Error("Neurology speciality is required for professor seed.")

  const adminHash = await bcrypt.hash("admin123", 10)
  const professorHash = await bcrypt.hash("professor123", 10)
  const studentHash = await bcrypt.hash("student123", 10)

  await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      fullName: "Admin User",
      email: "admin@demo.com",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  })

  const professor = await prisma.user.upsert({
    where: { email: "professor@demo.com" },
    update: { specialityId: neurology.id },
    create: {
      fullName: "Dr. Sarah Johnson",
      email: "professor@demo.com",
      passwordHash: professorHash,
      role: "PROFESSOR",
      specialityId: neurology.id,
    },
  })

  await prisma.user.upsert({
    where: { email: "student@demo.com" },
    update: {},
    create: {
      fullName: "Alex Martin",
      email: "student@demo.com",
      passwordHash: studentHash,
      role: "STUDENT",
    },
  })

  await prisma.platformSettings.upsert({
    where: { id: "global" },
    update: { enforceFiveQcmOptions: true },
    create: { id: "global", enforceFiveQcmOptions: true },
  })

  const fullExamQcm: SeedQcm = {
    id: "qcm-th-2024-full-exam",
    title: "Epreuve TH - 11 Juin 2024 - Extraits complets",
    description: "QCM complet extrait de l’épreuve TH du 11 juin 2024. Contient 59 questions avec barème par question.",
    specialityName: "Sciences médicales intégrées",
    classLevelName: EXAM_CLASS_LEVEL,
    year: 2024,
    questions: examQuestions,
  }

  const topicQcms: SeedQcm[] = splitQcms.map((qcm, index) => ({
    ...qcm,
    classLevelName: EXAM_CLASS_LEVEL,
    year: 2024,
    questions: questionsInRange(splitRanges[index][0], splitRanges[index][1]),
  }))

  for (const qcm of [fullExamQcm, ...topicQcms]) {
    const speciality = specialityByName.get(qcm.specialityName)
    if (!speciality) throw new Error(`Missing speciality ${qcm.specialityName}`)

    const classLevel = await ensureClassLevel(qcm.classLevelName, speciality.id)
    await refreshSeededQcm(qcm, professor.id, speciality.id, classLevel.id)
    console.log(`Seeded ${qcm.title} (${qcm.questions.length} questions)`)
  }

  console.log("Seed complete.")
  console.log("Admin: admin@demo.com / admin123")
  console.log("Professor: professor@demo.com / professor123")
  console.log("Student: student@demo.com / student123")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
