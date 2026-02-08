

# Optimisation commerciale des descriptions de plateformes

## Diagnostic

Les descriptions actuelles dans `src/lib/constants.ts` sont des copies de README techniques, pas du copywriting marketing. Problemes identifies :

1. **Jargon technique interdit en public** : "Stack : React 18, Supabase", "Edge Functions", "RLS", "SSE", "lazy-loaded" — viole la regle de branding (remplacer par termes accessibles)
2. **Donnees redondantes** : les descriptions repetent les stats (commits, tables, tests) alors que la grille de stats les affiche deja visuellement
3. **Aucune proposition de valeur claire** : le visiteur ne comprend pas en 3 secondes ce que la plateforme resout
4. **Ton inconsistant** : certaines descriptions parlent au "tu" (NEARVITY), d'autres sont impersonnelles

## Corrections proposees dans `src/lib/constants.ts`

### EmotionsCare
- **Actuel** : "Plateforme de gestion du bien-etre emotionnel pour les professionnels de sante et etudiants en medecine. 37 modules (Scan IA, Coach Nyvee, Musicotherapie, VR, Gamification XP). Stack : React 18, Supabase, 261 Edge Functions, 723 tables, 7 723 commits, 294 tests."
- **Propose** : "Premiere plateforme francaise dediee au bien-etre emotionnel des soignants et etudiants en medecine. 37 modules integres : scan emotionnel par IA, coaching personnalise avec Nyvee, musicotherapie, realite virtuelle et gamification. Concu pour reduire l'epuisement professionnel et renforcer la resilience au quotidien."
- **shortDescription** : "Bien-etre emotionnel des soignants et etudiants en medecine"

### NEARVITY
- **Actuel** : "PWA mobile-first de connexion sociale. Radar temps reel pour visualiser les personnes disponibles autour de toi (3 etats : ouvert, conditionnel, occupe). Sessions binome, ghost mode, chat de groupe. Stack : React 18, Mapbox, Lovable Cloud, 15 tables, 8 Edge Functions."
- **Propose** : "Application mobile de connexion sociale en temps reel pour etudiants. Un radar intelligent detecte qui est disponible autour de vous selon 3 signaux (ouvert, conditionnel, occupe). Sessions en binome, mode fantome et messagerie de groupe pour des rencontres authentiques sur le campus."

### System Compass
- **Actuel** : "Plateforme d'aide a la decision pour relocalisation internationale (B2C expats/nomades, B2B entrepreneurs/institutions). Exit Keys personnalisees, analyse 50+ pays, simulation fiscale, gamification. 1 272 commits, 718 tests passants, 103 routes lazy-loaded, 57 tables avec RLS, 25 Edge Functions."
- **Propose** : "Intelligence decisionnelle pour la relocalisation internationale. Analyse personnalisee de 50+ pays avec simulation fiscale, comparaison qualite de vie et recommandations sur mesure. Pour expatries, nomades digitaux, entrepreneurs et institutions cherchant le meilleur alignement pays-profil."

### Growth Copilot
- **Actuel** : "Growth OS : 39 employes IA premium (2 Direction CGO/QCO + 37 agents repartis dans 11 departements). Core OS avec RBAC, Approval Gate, Audit Log, Scheduler. 30 tables, 25 Edge Functions. Automatisation complete Marketing, Ventes, Finance, Produit, Engineering."
- **Propose** : "Votre equipe de 39 experts IA prets a l'emploi. 2 directeurs et 37 agents specialises couvrent 11 departements : marketing, ventes, finance, produit, engineering et plus. Chaque tache est validee, tracee et automatisee. La competence premium d'une equipe complete, sans la complexite."

### Med MNG
- **Actuel** : "Plateforme anti-panique cognitive pour etudiants en medecine (ECN/EDN). Une chanson = un item medical maitrise. Medical AI Copilot (GPT-4o, Perplexity, Firecrawl), streaming SSE, generation musicale IA. 4 522 commits, 50 tables, 30 Edge Functions. Score audit 20/20, Grade Securite A+."
- **Propose** : "Revolution de l'apprentissage medical par la musique. Chaque item ECN/EDN devient une chanson generee par IA que vous retenez naturellement. Copilote medical intelligent pour la recherche, la revision et la comprehension. L'anti-panique cognitif des futurs medecins — securite certifiee A+."

### Swift Care Hub
- **Actuel** : "Plateforme complete dediee aux urgences hospitalieres. Triage intelligent par IA, gestion des flux patients en temps reel, coordination des equipes soignantes et analytics de performance. Optimisation des temps d'attente et alertes critiques."
- **Propose** : "Solution de pilotage des urgences hospitalieres. Triage intelligent par IA, suivi des flux patients en temps reel, coordination des equipes soignantes et tableaux de bord de performance. Chaque seconde gagnee peut sauver une vie."

### Track Triumph Tavern
- **Actuel** : "Plateforme de tracking de performances avec gamification integree. Classements dynamiques, defis personnalises, recompenses et analytics avancees. Suivi en temps reel des objectifs et progression communautaire."
- **Propose** : "Plateforme de suivi de performances qui transforme chaque objectif en defi motivant. Classements dynamiques, recompenses personnalisees et progression communautaire. Suivez vos performances en temps reel et celebrez chaque victoire avec votre equipe."

## Principes appliques

- **Zero jargon technique** : plus aucune mention de Stack, Edge Functions, tables, commits, RLS, SSE dans les descriptions (les stats sont deja dans la grille visuelle)
- **Proposition de valeur en premiere phrase** : le visiteur comprend en 3 secondes
- **Ton uniforme** : vouvoiement professionnel partout
- **Accroche emotionnelle** : chaque description se termine par un benefice humain, pas une spec technique

## Section technique

**Fichier modifie** : `src/lib/constants.ts` uniquement (7 champs `description` + ajustements mineurs sur `shortDescription`)

**Risque** : Faible — modifications textuelles pures, aucun changement de structure ni de logique.

**Impact** : Les descriptions sont utilisees sur `/plateformes` (description complete) et sur `/` + `PlatformShowcase` (shortDescription). Tous les champs `features`, `stats`, `tagline` restent inchanges.

